import pool from '../config/db.js';
import { emitToUser } from './socket.js';

export const sendNotification = async (userId, title, message, type, relatedId = null) => {
    try {
        const result = await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, related_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, user_id, title, message, type, is_read, related_id, created_at`,
            [userId, title, message, type, relatedId]
        );
        
        const notification = result.rows[0];
        
        // Emit in real-time
        emitToUser(userId, 'notification', notification);
        
        return notification;
    } catch (err) {
        console.error('Error creating notification:', err.message);
        throw err;
    }
};
