import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';
import './config/passport.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ 
    origin: process.env.CLIENT_URL, 
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Apply general API rate limiter globally
app.use('/api', apiRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Ridivo API is running' });
});

export default app;