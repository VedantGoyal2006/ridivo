import { createVerification, getVerificationByUserId,getAllPendingVerifications,getAllVerifications,approveVerification,rejectVerification} from '../models/verificationModel.js';
import pool from '../config/db.js';

// POST /api/verification/apply
export const applyForVerification = async (req, res) => {
    try {
        const { license_number, license_expiry, license_image_url, aadhar_number, aadhar_image_url } = req.body;

        // 1. Check all fields
        if (!license_number || !license_expiry || !aadhar_number) {
            return res.status(400).json({ 
                message: 'License number, expiry and aadhar number are required' 
            });
        }

        // 2. Check if already applied
        const existing = await getVerificationByUserId(req.user.id);
        if (existing) {
            // If rejected, allow reapply
            if (existing.status === 'REJECTED') {
                await pool.query(
                    `DELETE FROM driver_verifications WHERE user_id = $1`,
                    [req.user.id]
                );
            } else {
                return res.status(400).json({ 
                    message: `Verification already ${existing.status.toLowerCase()}` 
                });
            }
        }

        // 3. Create verification
        const verification = await createVerification(
            req.user.id,
            license_number,
            license_expiry,
            license_image_url,
            aadhar_number,
            aadhar_image_url
        );

        return res.status(201).json({
            message: 'Verification application submitted successfully',
            verification
        });

    } catch (err) {
        console.error('Apply verification error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/verification/status
export const getVerificationStatus = async (req, res) => {
    try {
        const verification = await getVerificationByUserId(req.user.id);

        if (!verification) {
            return res.status(200).json({ 
                status: 'NOT_APPLIED',
                message: 'You have not applied for verification yet'
            });
        }

        return res.status(200).json({ verification });

    } catch (err) {
        console.error('Get verification status error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/admin/verifications
export const getAllVerificationsAdmin = async (req, res) => {
    try {
        const verifications = await getAllVerifications();
        return res.status(200).json({ verifications });

    } catch (err) {
        console.error('Get all verifications error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/admin/verifications/pending
export const getPendingVerificationsAdmin = async (req, res) => {
    try {
        const verifications = await getAllPendingVerifications();
        return res.status(200).json({ verifications });

    } catch (err) {
        console.error('Get pending verifications error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/admin/verifications/:id/approve
export const approveVerificationAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const verification = await approveVerification(id, req.user.id);

        if (!verification) {
            return res.status(404).json({ message: 'Verification not found' });
        }

        return res.status(200).json({
            message: 'Verification approved successfully',
            verification
        });

    } catch (err) {
        console.error('Approve verification error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/admin/verifications/:id/reject
export const rejectVerificationAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;

        if (!rejection_reason) {
            return res.status(400).json({ 
                message: 'Rejection reason is required' 
            });
        }

        const verification = await rejectVerification(id, req.user.id, rejection_reason);

        if (!verification) {
            return res.status(404).json({ message: 'Verification not found' });
        }

        return res.status(200).json({
            message: 'Verification rejected',
            verification
        });

    } catch (err) {
        console.error('Reject verification error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};