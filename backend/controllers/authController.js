import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { createUser, findUserByEmail } from '../models/userModel.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // 1. Check all fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email and password are required' 
            });
        }

        // 2. Check if email already exists
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Email already registered' 
            });
        }

        // 3. Validate password length
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters' 
            });
        }

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Create user in DB
        const newUser = await createUser(name, email, hashedPassword, phone);

        // 6. Generate tokens
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        // 7. Store refresh token in sessions table
        await pool.query(
            `INSERT INTO sessions (user_id, refresh_token, expires_at) 
             VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
            [newUser.id, refreshToken]
        );

        // 8. Send refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        // 9. Send response
        return res.status(201).json({
            message: 'Account created successfully',
            accessToken,
            user: newUser
        });

    } catch (err) {
        console.error('Signup error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};





export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check all fields
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // 2. Check if user exists
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid email or password' 
            });
        }

        // 3. Check if account is active
        if (!user.is_active) {
            return res.status(403).json({ 
                message: 'Your account has been deactivated' 
            });
        }

        // 4. Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Invalid email or password' 
            });
        }

        // 5. Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // 6. Store refresh token in sessions table
        await pool.query(
            `INSERT INTO sessions (user_id, refresh_token, expires_at) 
             VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
            [user.id, refreshToken]
        );

        // 7. Send refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        // 8. Send response
        return res.status(200).json({
            message: 'Login successful',
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile_pic: user.profile_pic,
                is_admin: user.is_admin,
                is_active: user.is_active,
                created_at: user.created_at
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};





export const refreshToken = async (req, res) => {
    try {
        // 1. Get refresh token from cookie
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ 
                message: 'No refresh token found' 
            });
        }

        // 2. Check if token exists in sessions table
        const session = await pool.query(
            `SELECT * FROM sessions WHERE refresh_token = $1`,
            [token]
        );
        if (session.rows.length === 0) {
            return res.status(401).json({ 
                message: 'Invalid refresh token' 
            });
        }

        // 3. Check if session is expired
        if (new Date() > new Date(session.rows[0].expires_at)) {
            await pool.query(
                `DELETE FROM sessions WHERE refresh_token = $1`,
                [token]
            );
            return res.status(401).json({ 
                message: 'Refresh token expired, please login again' 
            });
        }

        // 4. Verify refresh token
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // 5. Find user
        const user = await findUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ 
                message: 'User not found' 
            });
        }

        // 6. Generate new access token
        const accessToken = generateAccessToken(user);

        return res.status(200).json({ 
            accessToken 
        });

    } catch (err) {
        console.error('Refresh token error:', err.message);
        return res.status(401).json({ 
            message: 'Invalid refresh token' 
        });
    }
};




export const logout = async (req, res) => {
    try {
        // 1. Get refresh token from cookie
        const token = req.cookies.refreshToken;

        if (token) {
            // 2. Delete session from DB
            await pool.query(
                `DELETE FROM sessions WHERE refresh_token = $1`,
                [token]
            );
        }

        // 3. Clear cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'strict'
        });

        return res.status(200).json({ 
            message: 'Logged out successfully' 
        });

    } catch (err) {
        console.error('Logout error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};



export const googleAuthCallback = async (req, res) => {
    try {
        const user = req.user;

        // 1. Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // 2. Store refresh token in sessions table
        await pool.query(
            `INSERT INTO sessions (user_id, refresh_token, expires_at)
             VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
            [user.id, refreshToken]
        );

        // 3. Send refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        // 4. Redirect to frontend with access token
        res.redirect(
            `${process.env.CLIENT_URL}/auth/success?token=${accessToken}`
        );

    } catch (err) {
        console.error('Google callback error:', err.message);
        res.redirect(`${process.env.CLIENT_URL}/auth/failed`);
    }
};