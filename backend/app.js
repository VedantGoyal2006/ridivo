import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import session from 'express-session';
import sessionStore from './config/sessionStore.js';
import passport from 'passport';
import './config/passport.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
dotenv.config();

const app = express();

//This CORS configuration allows only my frontend application to access the backend APIs and permits cookies to be sent along with requests for authentication.

app.use(cors({ 
    origin: process.env.CLIENT_URL,  //I allow requests only from my frontend running on http://localhost:5173
    credentials: true     //Frontend is allowed to send cookies to the backend
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET || 'ridivo_session_secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        secure: false, // Set to true if using HTTPS in prod
        sameSite: 'lax', // Required for Google OAuth callback flow
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
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
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Ridivo API is running' });
});

export default app;