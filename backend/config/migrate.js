import pool from './db.js';

export const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('Running database migrations...');
        await client.query('BEGIN');

        // 1. Fix the sessions table if it's incorrect or missing columns
        // Since we are moving to standard schema, let's drop the table if it doesn't match
        // Or create it with correct columns.
        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                refresh_token   VARCHAR(255) NOT NULL UNIQUE,
                expires_at      TIMESTAMP NOT NULL
            );
        `);

        // Add OTP columns to bookings table if not present
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS otp_hash VARCHAR(255),
            ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS sos_active BOOLEAN DEFAULT FALSE;
        `);

        // 2. Add performance indexes to make queries blazing fast
        console.log('Creating database indexes...');
        
        // Users Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);`);
        
        // Driver Verification Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_driver_verifications_user ON driver_verifications(user_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_driver_verifications_status ON driver_verifications(status);`);

        // Vehicles Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_vehicles_driver ON vehicles(driver_id);`);

        // Sessions Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);`);

        // Rides Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON rides(departure_time);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_rides_origin_dest ON rides(origin, destination);`);

        // Bookings Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_traveler ON bookings(traveler_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_ride ON bookings(ride_id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`);

        // Payments & Refunds Indexes
        await client.query(`CREATE INDEX IF NOT EXISTS idx_payments_booking ON bookings(id);`);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_refunds_booking ON bookings(id);`);

        await client.query('COMMIT');
        console.log('Database migrations completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration error:', err.message);
        throw err;
    } finally {
        client.release();
    }
};
