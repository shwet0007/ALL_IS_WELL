import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for AI endpoints (more expensive)
export const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 AI requests per windowMs
    message: 'Too many AI requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Very strict for generation endpoints
export const generationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit to 10 generations per hour
    message: 'Generation limit reached, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
