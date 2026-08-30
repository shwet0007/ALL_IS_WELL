import mongoose from 'mongoose';
import { config } from '../config/env';
import User from '../models/User';
import Schedule from '../models/Schedule';
import Reminder from '../models/Reminder';
import { scanSchedulesAndCreateReminders } from '../utils/cron';
import { getTodayStr } from '../utils/date.util';

// Mock dependencies if needed, or rely on real DB connection
// Ensure you have a valid .env file in backend/

const runTest = async () => {
    try {
        console.log('--- Starting Reminder System Test ---');

        // 1. Connect to Database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(config.mongoUri);
            console.log('Connected to MongoDB');
        }

        // 2. Setup Test Data
        const testUserId = 'test-user-' + Date.now();
        const testUser = await User.create({
            firebase_uid: testUserId,
            name: 'Test Mom',
            email: `test-${Date.now()}@example.com`,
            role: 'mother',
            language: 'en',
            emergencyContact: {
                name: 'Dad',
                phone: '1234567890'
            }
        });
        console.log(`Created test user: ${testUserId}`);

        // Calculate time 15 minutes from now
        const now = new Date();
        const fifteenMinutesLater = new Date(now.getTime() + 15 * 60000);
        const hours = fifteenMinutesLater.getHours();
        const minutes = fifteenMinutesLater.getMinutes();
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const dateStr = getTodayStr(); // Use backend utility for consistent timezone

        const testSchedule = await Schedule.create({
            userId: testUserId,
            title: 'Test Vitamin C',
            type: 'medication',
            time: timeStr,
            date: dateStr,
            completed: false
        });
        console.log(`Created test schedule: "${testSchedule.title}" at ${timeStr} on ${dateStr}`);

        // 3. Trigger Cron Logic
        console.log('Running scanSchedulesAndCreateReminders()...');
        await scanSchedulesAndCreateReminders();

        // 4. Verify Reminder Creation
        const reminder = await Reminder.findOne({
            userId: testUserId,
            sourceId: testSchedule._id.toString(),
            date: dateStr
        });

        if (reminder) {
            console.log('✅ SUCCESS: Reminder created successfully!');
            console.log(JSON.stringify(reminder.toJSON(), null, 2));
        } else {
            console.error('❌ FAILURE: Reminder was NOT created.');
            // Debug: Find generic
            const all = await Reminder.find({ userId: testUserId });
            console.log(`Found ${all.length} reminders for user ${testUserId}:`);
            all.forEach(r => {
                console.log(`- ID: ${r._id}, SourceId: '${r.sourceId}', Date: '${r.date}', UserId: '${r.userId}'`);
            });
            console.log(`Searching for: SourceId: '${testSchedule._id.toString()}', Date: '${dateStr}'`);
        }

        // 5. Cleanup
        console.log('Cleaning up test data...');
        await Schedule.deleteMany({ userId: testUserId });
        await Reminder.deleteMany({ userId: testUserId });
        await User.deleteMany({ firebase_uid: testUserId });
        console.log('Cleanup complete.');

    } catch (error: any) {
        console.error('Test failed with error:', error.message);
        if (error.errors) {
            console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        }
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

runTest();
