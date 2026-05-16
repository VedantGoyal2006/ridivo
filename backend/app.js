import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ 
    origin: process.env.CLIENT_URL, 
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/vehicles', vehicleRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Ridivo API is running' });
});

export default app;