import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import session from 'express-session';
import sessionStore from './config/sessionStore.js';
import passport from 'passport';
import './config/passport.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
dotenv.config();

const app = express();

// Apply custom security headers
app.use(securityHeaders);

// Configure CORS
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'].filter(Boolean);

app.use(cors({ 
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        // Allow any Vercel deployment URL or localhost or custom CLIENT_URL
        const isVercel = /\.vercel\.app$/.test(origin);
        const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
        if (allowedOrigins.includes(origin) || isVercel || isLocal) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true     // Allow cookies
}));
app.use(express.json());    // Parse JSON
app.use(cookieParser());    // Parse cookies

// Configure Session
app.use(session({           
    secret: process.env.SESSION_SECRET || 'ridivo_session_secret',      
    resave: false,      
    saveUninitialized: false,       
    store: sessionStore,        
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());        

// Apply general API rate limiter globally
app.use('/api', apiRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Ridivo API is running' });
});

// Centralized error handler
app.use(errorHandler);

export default app;









/*

sameSite controls when cookies are sent across sites.
There are three values:
Strict – Cookie is only sent when navigating within the same site. Very secure, but can break some login flows.
Lax – Cookie is sent for normal top-level navigations (like clicking a link), but not for most cross-site POST requests. This balances security and usability.
None – Cookie is sent in all cross-site requests, but must be used with secure: true (HTTPS)





*/