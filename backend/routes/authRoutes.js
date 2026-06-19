import express from 'express';
import passport from 'passport';
import { 
    signup, 
    login, 
    logout,
    googleAuthCallback
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';
import { validateSignup, validateLogin } from '../middleware/validator.js';

const router = express.Router();

// Email/Password routes
router.post('/signup', loginRateLimiter, validateSignup, signup);
router.post('/login', loginRateLimiter, validateLogin, login);
router.post('/logout', protect, logout);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/google/callback',
    passport.authenticate('google', { 
        session: true,
        failureRedirect: '/api/auth/google/failed'
    }),
    googleAuthCallback
);

router.get('/google/failed', (req, res) => {
    res.status(401).json({ message: 'Google authentication failed' });
});

export default router;