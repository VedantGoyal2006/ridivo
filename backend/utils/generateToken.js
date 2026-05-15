import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate access token - expires in 15 minutes
export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, is_admin: user.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

// Generate refresh token - expires in 30 days
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '30d' }
    );
};