import Reminder from '../models/Reminder';
import User from '../models/User';
import { getRandomBabyMessage, getCategoryFromType } from './babyReminderMessages';
import { generateBabyMessage } from '../services/groq.service';

export interface CreateReminderParams {
    userId: string;
    sourceType: 'schedule' | 'doctor' | 'vaccine' | 'medicine';
    sourceId: string;
    title: string;
    time: string;
    date: string;
    babyMessage?: string;
}

/**
 * Creates a reminder if it doesn't already exist for the given source.
 */
export const createReminder = async (params: CreateReminderParams) => {
    try {
        const { userId, sourceType, sourceId, title, time, date } = params;

        // Check if reminder already exists for THIS specific date
        const existing = await Reminder.findOne({ userId, sourceId, sourceType, date });
        if (existing) return existing;

        let babyMessage = params.babyMessage;
        if (!babyMessage) {
            try {
                // Fetch user profile for context
                const user = await User.findOne({ firebase_uid: userId }).lean();

                // Try generating AI message
                babyMessage = await generateBabyMessage(title, sourceType, user);
            } catch (aiError) {
                console.error('Failed to generate AI baby message:', aiError);
            }

            // Fallback to hardcoded messages if AI failed or returned empty
            if (!babyMessage) {
                const category = getCategoryFromType(sourceType === 'schedule' ? 'other' : sourceType, title);
                babyMessage = getRandomBabyMessage(category);
            }
        }

        const reminder = new Reminder({
            userId,
            sourceType,
            sourceId,
            title,
            time,
            date,
            babyMessage,
            sent: false
        });

        await reminder.save();

        // TODO: [PWA-HOOK] Trigger push notification here
        // We will call the notification service to send a real-time alert to the user's device
        console.log(`[PushHook] Ready to send notification for: ${title} at ${time} on ${date}`);

        return reminder;
    } catch (error) {
        console.error('Error creating reminder:', error);
        return null;
    }
};

/**
 * Checks if a scheduled time is within the next 240 minutes (4 hours).
 * Handles both specific dates and daily routines (missing dateStr).
 * Correctly handles the midnight rollover (e.g., call at 23:50 for 00:10).
 */
export const isWithinUpcomingWindow = (timeStr: string, dateStr?: string, windowMinutes: number = 240): boolean => {
    try {
        const now = new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);

        // helper to check if a specific date/time is within window from now
        const check = (d: Date) => {
            const diffInMs = d.getTime() - now.getTime();
            const diffInMinutes = diffInMs / (1000 * 60);
            return diffInMinutes >= 0 && diffInMinutes <= windowMinutes;
        };

        if (dateStr) {
            const scheduledDate = new Date(dateStr);
            scheduledDate.setHours(hours, minutes, 0, 0);
            return check(scheduledDate);
        } else {
            // Daily routine: check today AND tomorrow (to catch midnight rollover)
            const today = new Date();
            today.setHours(hours, minutes, 0, 0);

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(hours, minutes, 0, 0);

            return check(today) || check(tomorrow);
        }
    } catch (error) {
        return false;
    }
};

/**
 * Deletes all reminders associated with a specific source.
 */
export const deleteRemindersBySource = async (sourceId: string, sourceType: string) => {
    try {
        await Reminder.deleteMany({ sourceId, sourceType });
        console.log(`[Sync] Deleted reminders for ${sourceType} ${sourceId}`);
    } catch (error) {
        console.error('Error deleting reminders by source:', error);
    }
};

/**
 * Updates or creates a reminder when a source (like a schedule item) is updated.
 */
export const updateReminderBySource = async (params: CreateReminderParams) => {
    try {
        const { userId, sourceType, sourceId, title, time, date } = params;

        // 1. Find all reminders for this source
        const reminders = await Reminder.find({ userId, sourceId, sourceType });

        if (reminders.length > 0) {
            // 2. Update existing reminders
            for (const reminder of reminders) {
                const timeChanged = reminder.time !== time;
                const titleChanged = reminder.title !== title;
                const dateChanged = reminder.date !== date;

                reminder.title = title;
                reminder.time = time;
                reminder.date = date;

                // 3. Regenerate AI message if relevant info changed
                if (timeChanged || titleChanged || dateChanged) {
                    try {
                        const user = await User.findOne({ firebase_uid: userId }).lean();
                        reminder.babyMessage = await generateBabyMessage(title, sourceType, user);
                    } catch (aiError) {
                        console.error('Failed to regenerate AI message:', aiError);
                    }
                }

                await reminder.save();
            }
            console.log(`[Sync] Updated ${reminders.length} reminders for ${sourceType} ${sourceId}`);
        } else {
            // 4. If no reminders exist, check if we should create one now (urgent or soon)
            // This is proactive; the background job would also catch it eventually.
            const isSoon = isWithinUpcomingWindow(time, date);
            const isUrgent = sourceType === 'medicine' || sourceType === 'vaccine';

            if (isSoon || isUrgent) {
                await createReminder(params);
                console.log(`[Sync] Created new reminder for ${sourceType} ${sourceId} upon update`);
            }
        }
    } catch (error) {
        console.error('Error updating reminders by source:', error);
    }
};
