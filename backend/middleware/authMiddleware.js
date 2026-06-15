import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserById } from '../models/userModel.js';

dotenv.config();

export const protect = async (req, res, next) => {
    try {
        // 1. Check if token exists in cookies
        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ 
                message: 'Not authorized, no token' 
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find user from token
        const user = await findUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ 
                message: 'Not authorized, user not found' 
            });
        }

        // 5. Check if account is active
        if (!user.is_active) {
            return res.status(403).json({ 
                message: 'Your account has been deactivated' 
            });
        }

        // 6. Attach user to request
        req.user = user;
        next();

    } catch (err) {
        console.error('Auth middleware error:', err.message);
        return res.status(401).json({ 
            message: 'Not authorized, token invalid' 
        });
    }
};