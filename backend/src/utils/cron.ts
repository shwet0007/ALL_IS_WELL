import Schedule from '../models/Schedule';
import { createReminder, isWithinUpcomingWindow } from './reminder.util';
import { getTodayStr, getTomorrowStr } from './date.util';

/**
 * Scans all active schedules and creates reminders for those within the next 60 minutes.
 */
export const scanSchedulesAndCreateReminders = async () => {
    try {
        console.log('[BackgroundJob] Scanning schedules for upcoming reminders...');

        const todayStr = getTodayStr();
        const tomorrowStr = getTomorrowStr();

        // Find all incomplete schedule items that are either:
        // 1. For today
        // 2. For tomorrow (to catch midnight rollover)
        // 3. Daily routines (date is missing)
        const upcomingSchedules = await Schedule.find({
            completed: false,
            $or: [
                { date: todayStr },
                { date: tomorrowStr },
                { date: { $exists: false } },
                { date: "" }
            ]
        });

        let createdCount = 0;
        for (const item of upcomingSchedules) {
            const isUrgent = item.type === 'medication' || item.type === 'vaccination';
            const isSoon = isWithinUpcomingWindow(item.time, item.date);

            if (isUrgent || isSoon) {
                // For daily items without a date, we must decide if the reminder is for today or tomorrow
                // based on which one is within 4 hours.
                let targetDate = item.date || todayStr;

                // If it's a daily routine and today's instance is in the past, use tomorrow's date
                if (!item.date) {
                    const todayInstance = new Date();
                    const [h, m] = item.time.split(':').map(Number);
                    todayInstance.setHours(h, m, 0, 0);
                    if (todayInstance < new Date()) {
                        targetDate = tomorrowStr;
                    }
                }

                const reminder = await createReminder({
                    userId: item.userId,
                    sourceType: item.type === 'medication' ? 'medicine' : 'schedule',
                    sourceId: item._id.toString(),
                    title: item.title,
                    time: item.time,
                    date: targetDate,
                    babyMessage: item.babyMessage
                });
                if (reminder) createdCount++;
            }
        }

        if (createdCount > 0) {
            console.log(`[BackgroundJob] Created ${createdCount} new reminders.`);
        }
    } catch (error) {
        console.error('[BackgroundJob] Error scanning schedules:', error);
    }
};

/**
 * Starts the background job to run every 5 minutes.
 */
export const startBackgroundJobs = () => {
    // Run once at startup
    scanSchedulesAndCreateReminders();

    // Run every 5 minutes
    const FIVE_MINUTES = 5 * 60 * 1000;
    setInterval(scanSchedulesAndCreateReminders, FIVE_MINUTES);

    console.log('[BackgroundJob] Schedule scan job started (5 min interval).');
};
