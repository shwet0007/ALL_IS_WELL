import cron from 'node-cron';
import Reminder from '../models/Reminder';
import Notification from '../models/Notification';
import { getTodayStr } from '../utils/date.util';

export const initNotificationScheduler = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            console.log('[NotificationJob] Checking for due reminders...');
            await checkRemindersAndNotify();
        } catch (error) {
            console.error('[NotificationJob] Error:', error);
        }
    });

    console.log('[NotificationJob] Scheduler initialized (1-minute interval)');
};

export const checkRemindersAndNotify = async () => {
    const todayStr = getTodayStr();
    const now = new Date();

    // Find all potential reminders that haven't been sent
    // We fetch broader set and filter in code for precise time comparison
    const reminders = await Reminder.find({
        sent: false,
        // Optimization: Only look at reminders for today or past
        // We assume reminders with date > todayStr are definitely future
        date: { $lte: todayStr }
    });

    let count = 0;

    for (const reminder of reminders) {
        if (!reminder.time || !reminder.date) continue;

        let shouldNotify = false;

        if (reminder.date < todayStr) {
            // Past date - definitely overdue
            shouldNotify = true;
        } else if (reminder.date === todayStr) {
            // Today - check time
            const [hours, minutes] = reminder.time.split(':').map(Number);
            const reminderTime = new Date();
            reminderTime.setHours(hours, minutes, 0, 0);

            if (reminderTime <= now) {
                // Time has passed
                shouldNotify = true;
            }
        }

        if (shouldNotify) {
            // Create Notification
            await Notification.create({
                userId: reminder.userId,
                title: reminder.title,
                message: reminder.babyMessage || `It's time for ${reminder.title}`,
                sourceType: reminder.sourceType,
                sourceId: reminder.sourceId,
                isRead: false
            });

            // Mark reminder as sent
            reminder.sent = true;
            await reminder.save();
            count++;
        }
    }

    if (count > 0) {
        console.log(`[NotificationJob] Generated ${count} notifications.`);
    }
};
