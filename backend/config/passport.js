import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import pool from './db.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const name = profile.displayName;
                const google_id = profile.id;
                const profile_pic = profile.photos[0].value;

                // 1. Check if user already exists with this email
                const existingUser = await pool.query(
                    `SELECT * FROM users WHERE email = $1`,
                    [email]
                );

                // 2. If user exists
                if (existingUser.rows.length > 0) {
                    const user = existingUser.rows[0];

                    // Update google_id if not set
                    if (!user.google_id) {
                        await pool.query(
                            `UPDATE users SET google_id = $1, profile_pic = $2 
                             WHERE email = $3`,
                            [google_id, profile_pic, email]
                        );
                    }
                    return done(null, user);
                }

                // 3. If new user → create account
                const newUser = await pool.query(
                    `INSERT INTO users (name, email, google_id, profile_pic, is_email_verified)
                     VALUES ($1, $2, $3, $4, true)
                     RETURNING id, name, email, phone, profile_pic, is_admin, is_active, created_at`,
                    [name, email, google_id, profile_pic]
                );

                return done(null, newUser.rows[0]);

            } catch (err) {
                console.error('Google OAuth error:', err.message);
                return done(err, null);
            }
        }
    )
);

export default passport;