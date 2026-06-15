import pool from '../config/db.js';

// GET /api/notifications
export const getNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, message, type, is_read, related_id, created_at 
             FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 20`,
            [req.user.id]
        );
        return res.status(200).json({ notifications: result.rows });
    } catch (err) {
        console.error('getNotifications error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/notifications/mark-all-read
export const markAllRead = async (req, res) => {
    try {
        await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE user_id = $1 AND is_read = FALSE`,
            [req.user.id]
        );
        return res.status(200).json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('markAllRead error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE id = $1 AND user_id = $2
             RETURNING id, is_read`,
            [id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        return res.status(200).json({ message: 'Notification marked as read', notification: result.rows[0] });
    } catch (err) {
        console.error('markRead error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};
