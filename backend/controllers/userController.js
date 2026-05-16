import bcrypt from 'bcryptjs';
import { findUserById, updateUserProfile, updateUserPassword } from '../models/userModel.js';
import pool from '../config/db.js';

// GET /api/users/profile
export const getProfile = async (req, res) => {
    try {
        // req.user is set by auth middleware
        const user = await findUserById(req.user.id);

        // Get verification status
        const verification = await pool.query(
            `SELECT status, rejection_reason 
             FROM driver_verifications 
             WHERE user_id = $1`,
            [req.user.id]
        );

        return res.status(200).json({
            user,
            verification_status: verification.rows[0] || null
        });

    } catch (err) {
        console.error('Get profile error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, profile_pic } = req.body;

        if (!name) {
            return res.status(400).json({ 
                message: 'Name is required' 
            });
        }

        const updatedUser = await updateUserProfile(
            req.user.id,
            name,
            phone,
            profile_pic
        );

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (err) {
        console.error('Update profile error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/users/change-password
export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Old and new password are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'New password must be at least 6 characters' 
            });
        }

        // Get full user with password
        const result = await pool.query(
            `SELECT * FROM users WHERE id = $1`,
            [req.user.id]
        );
        const user = result.rows[0];

        // Check if user signed up with Google (no password)
        if (!user.password) {
            return res.status(400).json({ 
                message: 'Google login users cannot change password' 
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                message: 'Old password is incorrect' 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await updateUserPassword(req.user.id, hashedPassword);

        return res.status(200).json({ 
            message: 'Password changed successfully' 
        });

    } catch (err) {
        console.error('Change password error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};