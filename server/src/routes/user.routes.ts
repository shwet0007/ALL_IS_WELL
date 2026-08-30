import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

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

        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ profile: userDoc.data() });
    })
);

// Update user profile
router.put(
    '/profile',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const profileData = req.body;

        await db.collection('users').doc(userId).set(profileData, { merge: true });

        res.json({ success: true, message: 'Profile updated successfully' });
    })
);

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

        const diarySnapshot = await db
            .collection('users')
            .doc(userId)
            .collection('diary')
            .orderBy('date', 'desc')
            .get();

        const entries = diarySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({ entries });
    })
);

// Add diary entry
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

        const docRef = await db
            .collection('users')
            .doc(userId)
            .collection('diary')
            .add({
                ...entryData,
                createdAt: new Date().toISOString(),
            });

        res.json({ success: true, id: docRef.id });
    })
);

export default router;
