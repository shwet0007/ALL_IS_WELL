import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import User from '../models/User';
import DiaryEntry from '../models/DiaryEntry';
import Schedule from '../models/Schedule';
import Checkup from '../models/Checkup';
import MedicalReport from '../models/MedicalReport';
import DoctorNote from '../models/DoctorNote';
import CalendarItem from '../models/CalendarItem';

import DailyTask from '../models/DailyTask';
import DailyCheckup from '../models/DailyCheckup';
import * as groqService from '../services/groq.service';

const router = Router();

// --- User Profile Routes ---

// Get user profile
router.get(
    '/profile',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await User.findOne({ firebase_uid: userId });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ profile: user });
    })
);

// Get specific user profile (public info for doctor/patient view)
router.get(
    '/profile/:id',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const user = await User.findOne({ firebase_uid: id }).select('name role specialization clinicName email profileCompleted');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ profile: user });
    })
);

// Update/Create user profile
router.put(
    '/profile',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const email = req.user?.email;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const profileData = req.body;

        const user = await User.findOneAndUpdate(
            { firebase_uid: userId },
            {
                ...profileData,
                firebase_uid: userId,
                email: email || profileData.email,
                profileCompleted: true
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, profile: user, message: 'Profile updated successfully' });
    })
);

// Update FCM token
router.put(
    '/fcm-token',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { fcmToken, timezone } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        await User.findOneAndUpdate(
            { firebase_uid: userId },
            { fcmToken, timezone },
            { new: true }
        );

        res.json({ success: true, message: 'FCM token updated' });
    })
);

// --- Diary Routes ---

// Get diary entries
router.get(
    '/diary',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const entries = await DiaryEntry.find({ userId }).sort({ date: -1 });
        res.json({ entries });
    })
);

// Add/Update diary entry (enforce 1 per day)
router.post(
    '/diary',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const entryData = req.body;

        const entry = await DiaryEntry.findOneAndUpdate(
            { userId, date: entryData.date },
            { ...entryData, userId },
            { upsert: true, new: true }
        );

        res.json({ success: true, id: entry._id });
    })
);

// Delete diary entry
router.delete(
    '/diary/:date',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { date } = req.params;

        await DiaryEntry.findOneAndDelete({ userId, date });
        res.json({ success: true });
    })
);

// --- Schedule Routes ---

router.get(
    '/schedule',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const items = await Schedule.find({ userId }).sort({ time: 1 });
        res.json({ items });
    })
);

router.post(
    '/schedule',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const item = new Schedule({ ...req.body, userId });
        await item.save();

        // Create reminder if medication, vaccination, or within 4 hours
        const { createReminder, isWithinUpcomingWindow } = await import('../utils/reminder.util');

        const { type } = req.body;
        const isUrgentType = type === 'medication' || type === 'vaccination';
        const isSoon = isWithinUpcomingWindow(item.time, item.date);

        if (isUrgentType || isSoon) {
            let sourceType: 'medicine' | 'vaccine' | 'schedule' = 'schedule';
            if (type === 'medication') sourceType = 'medicine';
            else if (type === 'vaccination') sourceType = 'vaccine';

            await createReminder({
                userId: userId as string,
                sourceType,
                sourceId: item._id.toString(),
                title: item.title,
                time: item.time,
                date: item.date || new Date().toISOString().split('T')[0],
                babyMessage: item.babyMessage
            });
        }

        res.json({ success: true, item });
    })
);

router.patch(
    '/schedule/:id',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { id } = req.params;
        const item = await Schedule.findOneAndUpdate(
            { _id: id, userId },
            req.body,
            { new: true }
        );

        if (item) {
            // Sync with Reminders
            const { updateReminderBySource } = await import('../utils/reminder.util');
            const sourceType = item.type === 'medication' ? 'medicine' : 'schedule';

            await updateReminderBySource({
                userId: userId as string,
                sourceType,
                sourceId: item._id.toString(),
                title: item.title,
                time: item.time,
                date: item.date || new Date().toISOString().split('T')[0],
                babyMessage: item.babyMessage
            });
        }

        res.json({ success: true, item });
    })
);

router.delete(
    '/schedule/:id',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { id } = req.params;

        await Schedule.findOneAndDelete({ _id: id, userId });

        // Sync with Reminders: Delete all reminders for this schedule item
        const { deleteRemindersBySource } = await import('../utils/reminder.util');
        // We delete both 'medicine' and 'schedule' sourceType just in case
        await deleteRemindersBySource(id, 'medicine');
        await deleteRemindersBySource(id, 'schedule');

        res.json({ success: true });
    })
);

// --- Checkup Routes ---

router.get(
    '/checkups',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        // Search either as patient or scheduledBy (doctor)
        const checkups = await Checkup.find({
            $or: [{ patientId: userId }, { scheduledBy: userId }]
        }).sort({ date: -1 });
        res.json({ checkups });
    })
);

router.post(
    '/checkups',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const checkup = new Checkup({ ...req.body, scheduledBy: userId });
        await checkup.save();

        // Create reminder for checkup
        const { createReminder } = await import('../utils/reminder.util');
        await createReminder({
            userId: checkup.patientId, // Patient receives the reminder
            sourceType: 'doctor',
            sourceId: checkup._id.toString(),
            title: `Doctor Checkup: ${checkup.type}`,
            time: '10:00', // Default time if not provided in body
            date: new Date(checkup.date).toISOString().split('T')[0],
        });

        res.json({ success: true, checkup });
    })
);

// Request an appointment (Patient)
router.post(
    '/checkups/request',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await User.findOne({ firebase_uid: userId });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const { date, type, note, isUrgent } = req.body;

        const checkup = new Checkup({
            patientId: userId,
            patientName: user.name,
            date,
            type,
            note,
            isUrgent: isUrgent || false,
            status: 'pending',
            scheduledBy: userId // Self-scheduled request
        });

        await checkup.save();
        res.json({ success: true, checkup });
    })
);

// --- Medical Reports & Doctor Notes ---

router.get(
    '/reports',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const reports = await MedicalReport.find({ patientId: userId }).sort({ date: -1 });
        res.json({ reports });
    })
);

router.post(
    '/reports',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const report = new MedicalReport(req.body);
        await report.save();
        res.json({ success: true, report });
    })
);

router.get(
    '/notes',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const notes = await DoctorNote.find({ patientId: userId }).sort({ date: -1 });
        res.json({ notes });
    })
);

// --- Calendar Routes ---

router.get(
    '/calendar',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const items = await CalendarItem.find({ userId }).sort({ date: 1 });
        res.json({ items });
    })
);

router.post(
    '/calendar',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const item = new CalendarItem({ ...req.body, userId });
        await item.save();
        res.json({ success: true, item });
    })
);

router.put(
    '/calendar/:id',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { id } = req.params;
        const item = await CalendarItem.findOneAndUpdate(
            { _id: id, userId },
            req.body,
            { new: true }
        );
        res.json({ success: true, item });
    })
);

router.delete(
    '/calendar/:id',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { id } = req.params;
        await CalendarItem.findOneAndDelete({ _id: id, userId });
        res.json({ success: true });
    })
);

// --- Daily 1 Step Ahead Routes ---

// Get today's task (generate if missing)
router.get(
    '/daily-task',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const today = new Date().toISOString().split('T')[0];

        // 1. Try to find existing task
        let task = await DailyTask.findOne({ userId, date: today });

        // 2. If no task, generate one
        if (!task) {
            // Fetch profile for context
            const userProfile = await User.findOne({ firebase_uid: userId }).lean();

            // Generate task text
            const taskText = await groqService.generateDailyTask(userProfile);

            // Save new task
            task = new DailyTask({
                userId,
                date: today,
                task: taskText,
                status: 'pending'
            });
            await task.save();
        }

        // 3. Calculate Streak (consecutive days ending yesterday/today)
        // Simple optimization: Just count completed tasks for now to avoid complex aggregation
        const completedCount = await DailyTask.countDocuments({
            userId,
            status: 'completed'
        });

        res.json({ task, streak: completedCount });
    })
);

// Update task status
router.patch(
    '/daily-task/:id',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { id } = req.params;
        const { status, note } = req.body;

        const task = await DailyTask.findOneAndUpdate(
            { _id: id, userId },
            { status, note },
            { new: true }
        );

        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        res.json({ success: true, task });
    })
);

// --- Analytics Route ---

router.get(
    '/analytics',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Import models dynamically
        const EmergencyLog = (await import('../models/EmergencyLog')).default;
        const Vaccination = (await import('../models/Vaccination')).default;

        // Fetch user profile for role-based analytics
        const userProfile = await User.findOne({ firebase_uid: userId });

        // Fetch all relevant data
        const [diaryEntries, dailyTasks, scheduleItems, checkups, vaccinations, emergencyLogs, dailyCheckups] = await Promise.all([
            DiaryEntry.find({ userId }).sort({ date: -1 }).limit(30),
            DailyTask.find({ userId }).sort({ date: -1 }).limit(30),
            Schedule.find({ userId }),
            Checkup.find({ patientId: userId }).sort({ date: -1 }),
            Vaccination.find({ userId }).sort({ dueDate: 1 }),
            EmergencyLog.find({ userId }).sort({ timestamp: -1 }),
            DailyCheckup.find({ userId }).sort({ date: -1 }).limit(7)
        ]);

        // 1. Overview KPIs
        const completedTasks = dailyTasks.filter(t => t.status === 'completed');
        const taskStreak = completedTasks.length;
        const totalTasks = dailyTasks.length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

        const completedVaccines = vaccinations.filter(v => v.status === 'completed').length;
        const totalVaccines = vaccinations.length;
        const vaccinationProgress = totalVaccines > 0 ? Math.round((completedVaccines / totalVaccines) * 100) : 0;

        const totalSOSTriggers = emergencyLogs.length;
        const lastSOSDate = emergencyLogs.length > 0 ? emergencyLogs[0].timestamp : null;

        // 2. Daily Task Insights (Last 7 days)
        const last7DaysTasks = dailyTasks.slice(0, 7);
        const taskInsights = {
            completed: last7DaysTasks.filter(t => t.status === 'completed').length,
            skipped: last7DaysTasks.filter(t => t.status === 'skipped').length,
            pending: last7DaysTasks.filter(t => t.status === 'pending').length,
            streak: taskStreak
        };

        // 3. Routine & Schedule Analytics
        const scheduledRoutines = scheduleItems.length;
        const completedRoutines = scheduleItems.filter(s => s.completed).length;
        const routineAdherence = scheduledRoutines > 0 ? Math.round((completedRoutines / scheduledRoutines) * 100) : 0;

        // Weekly consistency (last 7 days)
        const weeklyConsistency = last7DaysTasks.map(task => ({
            date: task.date,
            completed: task.status === 'completed' ? 1 : 0
        })).reverse();

        // 4. Role-Based Metrics
        let roleBasedMetrics: any = {};
        if (userProfile?.role === 'pregnant') {
            const totalCheckups = checkups.length;
            const attendedCheckups = checkups.filter(c => c.status === 'completed').length;
            roleBasedMetrics = {
                type: 'pregnancy',
                checkupsAttended: attendedCheckups,
                checkupsScheduled: totalCheckups,
                attendanceRate: totalCheckups > 0 ? Math.round((attendedCheckups / totalCheckups) * 100) : 0,
                trimester: userProfile.trimester || 'N/A',
                highRisk: userProfile.highRisk || false
            };
        } else if (userProfile?.role === 'mother') {
            // Count feeding and sleep observations from diary
            const feedingLogs = diaryEntries.filter(e => e.text?.toLowerCase().includes('feed')).length;
            const sleepLogs = diaryEntries.filter(e => e.text?.toLowerCase().includes('sleep')).length;
            roleBasedMetrics = {
                type: 'infant',
                feedingObservations: feedingLogs,
                sleepObservations: sleepLogs,
                babyAge: userProfile.babyDob ? Math.floor((Date.now() - new Date(userProfile.babyDob).getTime()) / (1000 * 60 * 60 * 24 * 30)) + ' months' : 'N/A'
            };
        }

        // 5. Vaccination Tracking
        const upcomingVaccinations = vaccinations
            .filter(v => v.status === 'scheduled' && new Date(v.dueDate) > new Date())
            .slice(0, 5)
            .map(v => ({
                name: v.vaccineName,
                dueDate: v.dueDate,
                babyAge: v.babyAge
            }));

        const missedVaccinations = vaccinations.filter(v =>
            v.status === 'scheduled' && new Date(v.dueDate) < new Date()
        ).length;

        // 6. Emergency Summary
        const emergencyContactConfigured = userProfile?.emergencyContact?.phone ? true : false;

        // 7. Doctor Interaction
        const doctorConnected = userProfile?.doctorId ? true : false;
        const checkupsScheduled = checkups.filter(c => c.status === 'scheduled').length;
        const reportsUploaded = await MedicalReport.countDocuments({ patientId: userId });

        // Process mood and health trends (existing)
        const moodData = diaryEntries
            .filter(entry => entry.mood)
            .map(entry => ({
                date: entry.date,
                mood: entry.mood
            }));

        // Health data tracking removed - DiaryEntry doesn't have healthScore
        const healthData: any[] = [];

        // Symptom frequency from medicalConditions
        const symptomFrequency: Record<string, number> = {};
        diaryEntries.forEach(entry => {
            if (entry.medicalConditions && Array.isArray(entry.medicalConditions)) {
                entry.medicalConditions.forEach((condition: string) => {
                    symptomFrequency[condition] = (symptomFrequency[condition] || 0) + 1;
                });
            }
        });

        res.json({
            // Overview KPIs
            overview: {
                taskStreak,
                completionRate,
                vaccinationProgress,
                totalSOSTriggers,
                routineAdherence
            },
            // Daily Task Insights
            taskInsights,
            // Routine Analytics
            routineAnalytics: {
                scheduledRoutines,
                completedRoutines,
                adherenceRate: routineAdherence,
                weeklyConsistency
            },
            // Role-Based Metrics
            roleBasedMetrics,
            // Vaccination Tracking
            vaccinationTracking: {
                completed: completedVaccines,
                total: totalVaccines,
                progress: vaccinationProgress,
                upcoming: upcomingVaccinations,
                missed: missedVaccinations
            },
            // Emergency Summary
            emergencySummary: {
                totalTriggers: totalSOSTriggers,
                lastTrigger: lastSOSDate,
                contactConfigured: emergencyContactConfigured
            },
            // Doctor Interaction
            doctorInteraction: {
                connected: doctorConnected,
                checkupsScheduled,
                reportsUploaded
            },
            // Health Check-ins
            dailyCheckups: {
                last7Days: dailyCheckups.length,
                latest: dailyCheckups.length > 0 ? dailyCheckups[0] : null
            },
            // Existing metrics
            moodTrends: moodData,
            healthTrends: healthData,
            symptomFrequency,
            totalEntries: diaryEntries.length
        });
    })
);

// --- Daily Health Check-In Routes ---

// Get daily checkup status for today
router.get(
    '/daily-checkup/status',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const checkup = await DailyCheckup.findOne({ userId, date: today });

        res.json({ completed: !!checkup, checkup });
    })
);

// Submit daily checkup
router.post(
    '/daily-checkup',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await User.findOne({ firebase_uid: userId });
        if (!user || (user.role !== 'pregnant' && user.role !== 'mother')) {
            res.status(400).json({ error: 'Invalid user role for checkup' });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const { responses } = req.body;

        const checkup = await DailyCheckup.findOneAndUpdate(
            { userId, date: today },
            {
                userId,
                role: user.role,
                date: today,
                responses
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json({ success: true, checkup });
    })
);

// --- Doctor Connection Request Routes ---

// Get list of all doctors
router.get(
    '/doctors',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (_req: AuthRequest, res: Response) => {
        const doctors = await User.find({ role: 'doctor' })
            .select('firebase_uid name specialization clinicName')
            .lean();

        res.json({ doctors });
    })
);

// Send connection request to a doctor
router.post(
    '/doctor-request',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { doctorId } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const DoctorRequest = (await import('../models/DoctorRequest')).default;

        // Check if request already exists
        const existingRequest = await DoctorRequest.findOne({
            patientId: userId,
            doctorId,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            res.status(400).json({ error: 'Request already exists' });
            return;
        }

        // Get patient and doctor info
        const [patient, doctor] = await Promise.all([
            User.findOne({ firebase_uid: userId }),
            User.findOne({ firebase_uid: doctorId })
        ]);

        if (!patient || !doctor) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const request = new DoctorRequest({
            patientId: userId,
            patientName: patient.name,
            doctorId,
            doctorName: doctor.name,
            status: 'pending'
        });

        await request.save();
        res.json({ success: true, request });
    })
);

// Get pending requests (for doctors)
router.get(
    '/doctor-requests',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const DoctorRequest = (await import('../models/DoctorRequest')).default;

        const requests = await DoctorRequest.find({
            doctorId: userId,
            status: 'pending'
        }).sort({ requestDate: -1 });

        res.json({ requests });
    })
);

// Accept or reject connection request
router.patch(
    '/doctor-request/:id',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { id } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const DoctorRequest = (await import('../models/DoctorRequest')).default;

        const request = await DoctorRequest.findOne({ _id: id, doctorId: userId });

        if (!request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        request.status = status;
        request.responseDate = new Date();
        await request.save();

        // If accepted, update patient's doctorId
        if (status === 'accepted') {
            await User.findOneAndUpdate(
                { firebase_uid: request.patientId },
                {
                    doctorId: userId,
                    doctorName: request.doctorName
                }
            );
        }

        res.json({ success: true, request });
    })
);

export default router;
