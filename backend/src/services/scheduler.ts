import cron from 'node-cron';
import User from '../models/User';
import DailyCheckup from '../models/DailyCheckup';
import { sendPushNotification } from './notification.service';

export const initScheduler = () => {
    // Run every day at 8:00 PM (20:00)
    cron.schedule('0 20 * * *', async () => {
        console.log('Running daily health check reminder cron job at 20:00');
        await runDailyCheckupReminders();
    });

    console.log('Daily health check scheduler initialized (8:00 PM IST)');
};

export const runDailyCheckupReminders = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Find all users who are 'mother' or 'pregnant' and have an fcmToken
        const users = await User.find({
            role: { $in: ['mother', 'pregnant'] },
            fcmToken: { $exists: true, $ne: '' }
        });

        console.log(`Checking ${users.length} users for daily checkup reminders...`);

        for (const user of users) {
            // 2. Check if user has already submitted today's checkup
            const checkup = await DailyCheckup.findOne({
                userId: user.firebase_uid,
                date: today
            });

            if (!checkup) {
                // 3. Send FCM notification
                console.log(`Sending reminder to user ${user.name} (${user.firebase_uid})`);
                await sendPushNotification(user.fcmToken!, {
                    title: 'Daily Health Check 💙',
                    body: 'How was your day today? Take 2 minutes for your health.',
                    data: {
                        type: 'daily_checkup',
                        url: '/daily-checkup'
                    }
                });
            } else {
                console.log(`User ${user.name} already completed checkup for today.`);
            }
        }
    } catch (error) {
        console.error('Error running daily checkup reminders:', error);
    }
};
