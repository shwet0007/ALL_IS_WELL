import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as groqService from '../services/groq.service';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { aiLimiter, generationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Chat completion endpoint
router.post(
    '/chat',
    aiLimiter,
    optionalAuth,
    [
        body('prompt').isString().notEmpty().withMessage('Prompt is required'),
        body('language').optional().isString(),
        body('userProfile').optional().isObject(),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { prompt, language = 'en', userProfile, currentPage } = req.body;

        const response = await groqService.getChatCompletion(prompt, language, userProfile, currentPage);

        res.json({ response });
    })
);

// Generate personalized schedule
router.post(
    '/schedule',
    generationLimiter,
    optionalAuth,
    [
        body('userProfile').isObject().notEmpty().withMessage('User profile is required'),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { userProfile } = req.body;

        const schedule = await groqService.generateSchedule(userProfile);

        res.json({ schedule });
    })
);

// Generate personalized diet plan
router.post(
    '/diet',
    generationLimiter,
    optionalAuth,
    [
        body('userProfile').isObject().notEmpty().withMessage('User profile is required'),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { userProfile } = req.body;

        const diet = await groqService.generateDiet(userProfile);

        res.json({ diet });
    })
);

// Generate baby diet plan
router.post(
    '/baby-diet',
    generationLimiter,
    optionalAuth,
    [
        body('userProfile').isObject().notEmpty().withMessage('User profile is required'),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { userProfile } = req.body;

        const babyDiet = await groqService.generateBabyDiet(userProfile);

        res.json({ babyDiet });
    })
);

// Disease awareness
router.post(
    '/disease-awareness',
    aiLimiter,
    optionalAuth,
    [
        body('prompt').isString().notEmpty().withMessage('Prompt is required'),
        body('language').optional().isString(),
        body('userProfile').optional().isObject(),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { prompt, language = 'en', userProfile } = req.body;

        const response = await groqService.getDiseaseAwareness(prompt, language, userProfile);

        res.json({ response });
    })
);

// Vaccine suggestions
router.post(
    '/vaccine-suggestions',
    generationLimiter,
    optionalAuth,
    [
        body('userProfile').optional().isObject(),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const { userProfile } = req.body;

        const vaccines = await groqService.getVaccineSuggestions(userProfile);

        res.json({ vaccines });
    })
);

// Pregnancy checkup suggestions
router.post(
    '/pregnancy-checkups',
    generationLimiter,
    optionalAuth,
    [
        body('userProfile').optional().isObject(),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const { userProfile } = req.body;

        const checkups = await groqService.getPregnancyCheckups(userProfile);

        res.json({ checkups });
    })
);

export default router;
