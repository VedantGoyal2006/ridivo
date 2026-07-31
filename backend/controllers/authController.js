import bcrypt from 'bcryptjs';
import passport from 'passport';
import pool from '../config/db.js';
import { createUser, findUserByEmail } from '../models/userModel.js';

// SIGNUP CONTROLLER FLOW   {Signup => User inserted into database => req.login(newUser) => serializeUser(newUser) => Store user.id inside session => Session cookie sent to browser }
export const signup = async (req, res, next) => {
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

        
        /*
            Why? if after creating newUser in db i return status 200, 
            Database ✅ Session ❌ User is NOT authenticated

            What is req.login()?
            It is not an Express function.
            It is added by Passport.    {req.isAuthenticated(), req.login(), req.logout()}
        */

        // 6. Log the user in to establish session
        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(201).json({
                message: 'Account created successfully',
                user: newUser
            });
        });

    } catch (err) {
        console.error('Signup error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// LOGIN CONTROLLER FLOW {login Controller => passport.authenticate('local') => Local Strategy => Database => Password verification(bcrypt.comapre) => Returns User => req.login(newUser) => serializeUser(newUser) => Store user.id inside session => Session cookie sent to browser }
export const login = (req, res, next) => {
    const { email, password } = req.body;

    // 1. Check all fields
    if (!email || !password) {
        return res.status(400).json({ 
            message: 'Email and password are required' 
        });
    }

    // 2. Authenticate using Passport Local Strategy
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(400).json({ 
                message: info?.message || 'Invalid email or password' 
                
            });
        }

        // Establish session
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                message: 'Login successful',
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
        });
    })(req, res, next);
};

// LOGOUT CONTROLLER FLOW {logout controller => req.logout() => req.session.destroy() => clearCookie() => 200 success}
export const logout = (req, res, next) => {
    req.logout((err) => {   //Its job is only to remove the authenticated user from the request/session's Passport data. to remove req.user which we have attached at the time of deserialisation
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {  //this is provided by express-session {completely remove the session from session store, here i call the method destroy implemented in sessionStore.js}
            if (err) {
                console.error('Session destroy error during logout:', err.message);
            }
            res.clearCookie('connect.sid', { path: '/' });   //tells browser to delete session cookie
            return res.status(200).json({ 
                message: 'Logged out successfully' 
            });
        });
    });
};

// GOOGLE AUTH CALLBACK CONTROLLER
export const googleAuthCallback = async (req, res) => {
    try {
        // Passport session is already established by this point
        res.redirect(`${process.env.CLIENT_URL}/auth/success`);
    } catch (err) {
        console.error('Google callback error:', err.message);
        res.redirect(`${process.env.CLIENT_URL}/auth/failed`);
    }
};