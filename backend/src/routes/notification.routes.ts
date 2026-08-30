import { Router, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import Notification from '../models/Notification';

const router = Router();

// Get notifications for user
router.get(
    '/',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 }) // Latest first
            .limit(50); // Limit to last 50 to avoid overload

        res.json({ notifications });
    })
);

// Get unread count
router.get(
    '/unread-count',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const count = await Notification.countDocuments({ userId, isRead: false });
        res.json({ count });
    })
);

// Mark as read
router.patch(
    '/:id/read',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }

        res.json({ success: true, notification });
    })
);

// Mark all as read
router.patch(
    '/read-all',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        res.json({ success: true });
    })
);

export default router;
