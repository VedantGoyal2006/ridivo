import rateLimit from 'express-rate-limit';

// Helper to extract user ID from authenticated session, falling back to IP
const keyGenerator = (req) => {
    if (req.user && req.user.id) {
        return `user:${req.user.id}`;
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
