import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import User from '../models/User';
import DailyTask from '../models/DailyTask';
import DailyCheckup from '../models/DailyCheckup';
import Schedule from '../models/Schedule';
import Vaccination from '../models/Vaccination';
import EmergencyLog from '../models/EmergencyLog';
import MonthlyReport from '../models/MonthlyReport';
import Achievement from '../models/Achievement';

const router = Router();

// --- Health Consistency Score & Trends ---

router.get(
    '/dashboard-advanced',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const today = new Date();
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 7);

        // Fetch data for the last 7 days
        const [tasks, checkups, schedules, vaccinations] = await Promise.all([
            DailyTask.find({ userId, date: { $gte: last7Days.toISOString().split('T')[0] } }),
            DailyCheckup.find({ userId, date: { $gte: last7Days.toISOString().split('T')[0] } }),
            Schedule.find({ userId, date: { $gte: last7Days.toISOString().split('T')[0] } }),
            Vaccination.find({ userId })
        ]);

        // 1. Health Consistency Score calculation (Composite)
        const checkupComp = (checkups.length / 7) * 100;
        const taskComp = tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0;
        const scheduleComp = schedules.length > 0 ? (schedules.filter(s => s.completed).length / schedules.length) * 100 : 0;

        const consistencyScore = Math.min(100, Math.round((checkupComp * 0.4) + (taskComp * 0.3) + (scheduleComp * 0.3)));

        // 2. Trend Intelligence (Mood mapping)
        const moodMap: Record<string, number> = { 'Happy': 4, 'Calm': 3, 'Anxious': 2, 'Low': 1 };
        const moodTrends = checkups.map(c => ({
            date: c.date,
            score: moodMap[c.responses.mental] || 0,
            label: c.responses.mental
        })).sort((a, b) => a.date.localeCompare(b.date));


        res.json({
            consistencyScore,
            consistencyLabel: consistencyScore > 80 ? 'Excellent' : consistencyScore > 60 ? 'Good' : 'Needs Focus',
            moodTrends,
            kpis: {
                routine: {
                    value: Math.round(scheduleComp),
                    trend: '+5%', // Dummy for now, would need last week's data
                    status: scheduleComp > 70 ? 'Consistent' : 'Inconsistent weekends'
                },
                completion: {
                    value: Math.round(taskComp),
                    trend: '🔥 Consistent'
                }
            }
        });
    })
);

// --- Monthly Report ---

router.get(
    '/monthly-report/:month', // YYYY-MM
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { month } = req.params;

        let report = await MonthlyReport.findOne({ userId, month });

        if (!report) {
            // Generate basic one if not found (lazy generation)
            // In a real app, this might be a cron job
            report = new MonthlyReport({
                userId,
                month,
                consistencyScore: 75, // Default/Placeholder
                metrics: {
                    checkupCompletion: 80,
                    routineAdherence: 70,
                    vaccinationTimeliness: 100,
                    sleepRegularity: 65
                },
                highlights: ['Maintained consistent physical health check-ins', 'Vaccination schedule on track'],
                attentionAreas: ['Late night feeding routines were inconsistent']
            });
            await report.save();
        }

        res.json({ report });
    })
);

// --- Achievements ---

router.get(
    '/achievements',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const achievements = await Achievement.find({ userId });
        res.json({ achievements });
    })
);

export default router;
