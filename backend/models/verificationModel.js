import pool from '../config/db.js';

// Create verification application
export const createVerification = async (user_id, license_number, license_expiry, license_image_url, aadhar_number, aadhar_image_url) => {
    const result = await pool.query(
        `INSERT INTO driver_verifications 
         (user_id, license_number, license_expiry, license_image_url, aadhar_number, aadhar_image_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [user_id, license_number, license_expiry, license_image_url, aadhar_number, aadhar_image_url]
    );
    return result.rows[0];
};

// Get verification by user id
export const getVerificationByUserId = async (user_id) => {
    const result = await pool.query(
        `SELECT * FROM driver_verifications WHERE user_id = $1`,
        [user_id]
    );
    return result.rows[0];
};

// Get all pending verifications (admin)
export const getAllPendingVerifications = async () => {
    const result = await pool.query(
        `SELECT dv.*, u.name, u.email, u.phone 
         FROM driver_verifications dv
         JOIN users u ON dv.user_id = u.id
         WHERE dv.status = 'PENDING'
         ORDER BY dv.submitted_at ASC`
    );
    return result.rows;
};

// Get all verifications (admin)
export const getAllVerifications = async () => {
    const result = await pool.query(
        `SELECT dv.*, u.name, u.email, u.phone 
         FROM driver_verifications dv
         JOIN users u ON dv.user_id = u.id
         ORDER BY dv.submitted_at DESC`
    );
    return result.rows;
};

// Approve verification (admin)
export const approveVerification = async (id, reviewed_by) => {
    const result = await pool.query(
        `UPDATE driver_verifications
         SET status = 'APPROVED', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [reviewed_by, id]
    );
    return result.rows[0];
};

// Reject verification (admin)
export const rejectVerification = async (id, reviewed_by, rejection_reason) => {
    const result = await pool.query(
        `UPDATE driver_verifications
         SET status = 'REJECTED', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2
         WHERE id = $3
         RETURNING *`,
        [reviewed_by, rejection_reason, id]
    );
    return result.rows[0];
};