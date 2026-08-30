import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import Reminder from '../models/Reminder';
import { getTodayStr, getTomorrowStr } from '../utils/date.util';

const router = Router();

// Get active reminders
router.get(
    '/active',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const todayStr = getTodayStr();
        const tomorrowStr = getTomorrowStr();

        // Fetch reminders that haven't been sent/dismissed and are for today or tomorrow
        const reminders = await Reminder.find({
            userId,
            sent: false,
            date: { $in: [todayStr, tomorrowStr] }
        }).sort({ date: 1, time: 1 });
        res.json({ reminders });
    })
);

// Mark reminder as sent/dismissed
router.patch(
    '/:id',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { id } = req.params;
        const { sent } = req.body;

        const reminder = await Reminder.findOneAndUpdate(
            { _id: id, userId },
            { sent },
            { new: true }
        );

        if (!reminder) {
            res.status(404).json({ error: 'Reminder not found' });
            return;
        }

        res.json({ success: true, reminder });
    })
);

export default router;
