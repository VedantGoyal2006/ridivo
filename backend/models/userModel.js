import pool from '../config/db.js';

export const createUser = async (name, email, hashedPassword, phone) => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password, phone) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, name, email, phone, is_admin, is_active, created_at`,
        [name, email, hashedPassword, phone]
    );
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );
    return result.rows[0];
};

export const findUserById = async (id) => {
    const result = await pool.query(
        `SELECT id, name, email, phone, profile_pic, avg_rating, 
                total_rides, is_admin, is_active, created_at 
         FROM users WHERE id = $1`,
        [id]
    );
    return result.rows[0];
};

export const updateUserProfile = async (id, name, phone, profile_pic) => {
    const result = await pool.query(
        `UPDATE users 
         SET name = $1, phone = $2, profile_pic = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING id, name, email, phone, profile_pic, avg_rating, total_rides, is_admin, is_active, created_at`,
        [name, phone, profile_pic, id]
    );
    return result.rows[0];
};

export const updateUserPassword = async (id, hashedPassword) => {
    const result = await pool.query(
        `UPDATE users 
         SET password = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id`,
        [hashedPassword, id]
    );
    return result.rows[0];
};