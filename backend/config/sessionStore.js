import session from 'express-session';
import pool from './db.js';

class PostgresStore extends session.Store {
    constructor() {
        super();
    }

    async get(sid, callback) {
        try {
            const res = await pool.query(
                `SELECT user_id, expires_at FROM sessions 
                 WHERE refresh_token = $1 AND expires_at > NOW()`,
                [sid]
            );
            if (res.rows.length === 0) {
                return callback(null, null);
            }
            const sessionData = {
                passport: { user: res.rows[0].user_id },
                cookie: { expires: res.rows[0].expires_at }
            };
            callback(null, sessionData);
        } catch (err) {
            callback(err);
        }
    }

    async set(sid, sess, callback) {
        try {
            const userId = sess.passport?.user;
            if (!userId) {
                return callback(null); // No logged-in user in session, nothing to persist
            }

            const expiresAt = sess.cookie?.expires 
                ? new Date(sess.cookie.expires) 
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            // Check if session already exists for this sid
            const checkRes = await pool.query(
                `SELECT id FROM sessions WHERE refresh_token = $1`,
                [sid]
            );

            if (checkRes.rows.length > 0) {
                await pool.query(
                    `UPDATE sessions SET expires_at = $1 WHERE refresh_token = $2`,
                    [expiresAt, sid]
                );
            } else {
                await pool.query(
                    `INSERT INTO sessions (user_id, refresh_token, expires_at) 
                     VALUES ($1, $2, $3)`,
                    [userId, sid, expiresAt]
                );
            }
            callback(null);
        } catch (err) {
            callback(err);
        }
    }

    async destroy(sid, callback) {
        try {
            await pool.query(
                `DELETE FROM sessions WHERE refresh_token = $1`,
                [sid]
            );
            callback(null);
        } catch (err) {
            callback(err);
        }
    }
}

export default new PostgresStore();
