import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import * as sarvamService from '../services/sarvam.service';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Speech to text endpoint
router.post(
    '/speech-to-text',
    aiLimiter,
    optionalAuth,
    [
        body('audioData').isString().notEmpty().withMessage('Audio data is required'),
        body('language').optional().isString(),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { audioData, language = 'en-IN' } = req.body;

        const transcript = await sarvamService.speechToText(audioData, language);

        res.json({ transcript });
    })
);

// Text to speech endpoint
router.post(
    '/text-to-speech',
    aiLimiter,
    optionalAuth,
    [
        body('text').isString().notEmpty().withMessage('Text is required'),
        body('language').optional().isString(),
        body('speaker').optional().isString(),
    ],
    asyncHandler(async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { text, language = 'en-IN', speaker = 'meera' } = req.body;

        const audio = await sarvamService.textToSpeech(text, language, speaker);

        res.json({ audio });
    })
);

export default router;
