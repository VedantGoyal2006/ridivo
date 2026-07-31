import pool from '../config/db.js';

// GET /api/admin/users
export const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, is_admin, created_at 
             FROM users 
             ORDER BY created_at DESC`
        );
        return res.status(200).json({ users: result.rows });
    } catch (err) {
        console.error('Admin getUsers error:', err);
        return res.status(500).json({ message: 'Server error retrieving users list' });
    }
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, is_admin } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET role = COALESCE($1, role), 
                 is_admin = COALESCE($2, is_admin),
                 updated_at = NOW()
             WHERE id = $3 
             RETURNING id, name, email, role, is_admin`,
            [role, is_admin, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'User role updated successfully',
            user: result.rows[0]
        });
    } catch (err) {
        console.error('Admin updateUserRole error:', err);
        return res.status(500).json({ message: 'Server error updating user role' });
    }
};

// GET /api/admin/payments
export const getPaymentsAndRefunds = async (req, res) => {
    try {
        // Fetch all payment transactions
        const paymentsQuery = await pool.query(
            `SELECT p.*, u.name AS traveler_name, r.origin, r.destination
             FROM payments p
             JOIN users u ON p.traveler_id = u.id
             JOIN bookings b ON p.booking_id = b.id
             JOIN rides r ON b.ride_id = r.id
             ORDER BY p.created_at DESC`
        );

        // Fetch all refund transactions
        const refundsQuery = await pool.query(
            `SELECT ref.*, u.name AS traveler_name
             FROM refunds ref
             JOIN bookings b ON ref.booking_id = b.id
             JOIN users u ON b.traveler_id = u.id
             ORDER BY ref.created_at DESC`
        );

        return res.status(200).json({
            payments: paymentsQuery.rows,
            refunds: refundsQuery.rows
        });
    } catch (err) {
        console.error('Admin getPaymentsAndRefunds error:', err);
        return res.status(500).json({ message: 'Server error auditing payment transactions' });
    }
};

// GET /api/admin/stats
export const getSystemStats = async (req, res) => {
    try {
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const ridesCount = await pool.query("SELECT COUNT(*) FROM rides WHERE status = 'COMPLETED'");
        const activeRidesCount = await pool.query("SELECT COUNT(*) FROM rides WHERE status IN ('PUBLISHED', 'ACTIVE', 'ONGOING', 'ARRIVED')");
        const paymentsSum = await pool.query("SELECT SUM(amount) FROM payments WHERE status = 'SUCCESS'");

        // Fetch active SOS alerts
        const sosQuery = await pool.query(
            `SELECT b.id AS booking_id, u.name AS passenger_name, r.origin, r.destination, r.id AS ride_id, r.status AS ride_status,
                    v.vehicle_number, v.vehicle_name, b.sos_active, b.status AS booking_status, u_driver.name AS driver_name
             FROM bookings b
             JOIN users u ON b.traveler_id = u.id
             JOIN rides r ON b.ride_id = r.id
             JOIN users u_driver ON r.driver_id = u_driver.id
             LEFT JOIN vehicles v ON r.vehicle_id = v.id
             WHERE b.sos_active = TRUE AND b.status = 'STARTED'`
        );

        return res.status(200).json({
            stats: {
                total_users: parseInt(usersCount.rows[0].count),
                completed_rides: parseInt(ridesCount.rows[0].count),
                active_rides: parseInt(activeRidesCount.rows[0].count),
                total_revenue: parseFloat(paymentsSum.rows[0].sum || 0)
            },
            active_sos: sosQuery.rows
        });
    } catch (err) {
        console.error('Admin getSystemStats error:', err);
        return res.status(500).json({ message: 'Server error compiling system dashboard statistics' });
    }
};

// PUT /api/admin/sos/:id/resolve
export const resolveSOS = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE bookings SET sos_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'SOS tracking record not found' });
        }

        return res.status(200).json({
            message: 'SOS signal marked as RESOLVED and safety threat deactivated.',
            booking: result.rows[0]
        });
    } catch (err) {
        console.error('Admin resolveSOS error:', err);
        return res.status(500).json({ message: 'Server error resolving SOS safety alerts' });
    }
};
