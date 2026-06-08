import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Helper to extract user ID from JWT token (for per-user tracking), falling back to IP
const keyGenerator = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.decode(token);
            if (decoded && decoded.id) {
                return `user:${decoded.id}`;
            }
        }
    } catch (err) {
        // Ignore decoding errors and fallback to IP
    }
    return `ip:${req.ip}`;
};

// 1. Auth rate limiter: Max 5 attempts per minute
export const loginRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: { message: 'Too many login attempts. Please try again after 1 minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. General API rate limiter: Max 10 calls per second per user
export const apiRateLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 10,
    keyGenerator: keyGenerator,
    message: { message: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});
