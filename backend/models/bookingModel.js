import pool from '../config/db.js';

// Create a booking with race condition protection
export const createBooking = async (ride_id, traveler_id, seats_booked, pickup_point, drop_point) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const rideResult = await client.query(
            `SELECT available_seats, price_per_seat, status
             FROM rides WHERE id = $1 FOR UPDATE`,
            [ride_id]
        );

        if (rideResult.rows.length === 0) {
            throw new Error('Ride not found');
        }

        const ride = rideResult.rows[0];

        if (ride.status !== 'ACTIVE') {
            throw new Error('Ride is not available for booking');
        }

        if (ride.available_seats < seats_booked) {
            throw new Error(`Only ${ride.available_seats} seat(s) available`);
        }

// Check if traveler has pickup/drop points that are waypoints
// If so calculate proportional fare
let total_fare = ride.price_per_seat * seats_booked;

if (pickup_point && drop_point && ride.total_distance) {
    // Get distances for pickup and drop points
    const pickupWaypoint = await client.query(
        `SELECT distance_from_origin FROM ride_waypoints 
         WHERE ride_id = $1 AND LOWER(location_name) = LOWER($2)`,
        [ride_id, pickup_point]
    );
    const dropWaypoint = await client.query(
        `SELECT distance_from_origin FROM ride_waypoints 
         WHERE ride_id = $1 AND LOWER(location_name) = LOWER($2)`,
        [ride_id, drop_point]
    );

    if (pickupWaypoint.rows.length > 0 && dropWaypoint.rows.length > 0) {
        const pickupDist = parseFloat(pickupWaypoint.rows[0].distance_from_origin);
        const dropDist = parseFloat(dropWaypoint.rows[0].distance_from_origin);
        const travelDist = dropDist - pickupDist;
        const proportion = travelDist / ride.total_distance;
        total_fare = ride.total_trip_cost * proportion * seats_booked;
        total_fare = Math.round(total_fare);
    }
}
        const bookingResult = await client.query(
            `INSERT INTO bookings 
                (ride_id, traveler_id, seats_booked, pickup_point, drop_point, total_fare, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
             RETURNING *`,
            [ride_id, traveler_id, seats_booked, pickup_point, drop_point, total_fare]
        );

        await client.query('COMMIT');

        return bookingResult.rows[0];

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Get all bookings by a traveler
export const getBookingsByTraveler = async (traveler_id) => {
    const result = await pool.query(
        `SELECT b.id, b.ride_id, b.traveler_id, b.seats_booked, b.pickup_point, b.drop_point, b.total_fare,
                b.cancelled_by, b.cancellation_reason, b.created_at, b.updated_at,
                CASE 
                    WHEN r.status = 'COMPLETED' THEN 'COMPLETED'
                    WHEN r.status = 'CANCELLED' THEN 'CANCELLED'
                    ELSE b.status 
                END AS status,
                r.origin, r.destination, r.departure_time, r.price_per_seat, r.status AS ride_status,
                u.name AS driver_name, u.avg_rating,
                v.vehicle_name, v.vehicle_type, v.vehicle_number
         FROM bookings b
         JOIN rides r ON b.ride_id = r.id
         JOIN users u ON r.driver_id = u.id
         JOIN vehicles v ON r.vehicle_id = v.id
         WHERE b.traveler_id = $1
         ORDER BY b.created_at DESC`,
        [traveler_id]
    );

    return result.rows;
};

// Get all bookings for a ride (driver view)
export const getBookingsByRide = async (ride_id) => {
    const result = await pool.query(
        `SELECT b.*,
                u.name AS traveler_name, u.avg_rating AS traveler_rating,
                u.profile_pic AS traveler_pic
         FROM bookings b
         JOIN users u ON b.traveler_id = u.id
         WHERE b.ride_id = $1
         ORDER BY b.created_at ASC`,
        [ride_id]
    );

    return result.rows;
};

// Get single booking by ID
export const getBookingById = async (booking_id) => {
    const result = await pool.query(
        `SELECT b.id, b.ride_id, b.traveler_id, b.seats_booked, b.pickup_point, b.drop_point, b.total_fare,
                b.cancelled_by, b.cancellation_reason, b.created_at, b.updated_at,
                CASE 
                    WHEN r.status = 'COMPLETED' THEN 'COMPLETED'
                    WHEN r.status = 'CANCELLED' THEN 'CANCELLED'
                    ELSE b.status 
                END AS status,
                r.driver_id, r.origin, r.destination,
                r.departure_time, r.available_seats,
                r.status AS ride_status, r.price_per_seat
         FROM bookings b
         JOIN rides r ON b.ride_id = r.id
         WHERE b.id = $1`,
        [booking_id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

// Accept a booking (driver action)
export const acceptBooking = async (booking_id) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Lock booking row
        const bookingResult = await client.query(
            `SELECT * FROM bookings WHERE id = $1 FOR UPDATE`,
            [booking_id]
        );

        const booking = bookingResult.rows[0];

        if (booking.status !== 'PENDING') {
            throw new Error('Only PENDING bookings can be accepted');
        }

        // Lock ride row and check seats
        const rideResult = await client.query(
            `SELECT available_seats FROM rides 
             WHERE id = $1 FOR UPDATE`,
            [booking.ride_id]
        );

        const ride = rideResult.rows[0];

        if (ride.available_seats < booking.seats_booked) {
            throw new Error('Not enough seats available anymore');
        }

        // Confirm the booking
        await client.query(
            `UPDATE bookings SET 
                status = 'CONFIRMED',
                updated_at = NOW()
             WHERE id = $1`,
            [booking_id]
        );

        // Decrease available seats in ride
        const newAvailable = ride.available_seats - booking.seats_booked;

        await client.query(
            `UPDATE rides SET
                available_seats = $1,
                status = CASE WHEN $1 = 0 THEN 'FULL' ELSE status END,
                updated_at = NOW()
             WHERE id = $2`,
            [newAvailable, booking.ride_id]
        );

        await client.query('COMMIT');

        // Return updated booking
        const updated = await pool.query(
            `SELECT * FROM bookings WHERE id = $1`,
            [booking_id]
        );

        return updated.rows[0];

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Reject a booking (driver action)
export const rejectBooking = async (booking_id) => {
    const result = await pool.query(
        `UPDATE bookings SET
            status = 'REJECTED',
            updated_at = NOW()
         WHERE id = $1 AND status = 'PENDING'
         RETURNING *`,
        [booking_id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
};

// Cancel a booking (traveler action)
export const cancelBooking = async (booking_id, cancelled_by, cancellation_reason) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Lock booking row
        const bookingResult = await client.query(
            `SELECT * FROM bookings WHERE id = $1 FOR UPDATE`,
            [booking_id]
        );

        const booking = bookingResult.rows[0];

        if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
            throw new Error('This booking cannot be cancelled');
        }

        // Cancel the booking
        await client.query(
            `UPDATE bookings SET
                status = 'CANCELLED',
                cancelled_by = $1,
                cancellation_reason = $2,
                updated_at = NOW()
             WHERE id = $3`,
            [cancelled_by, cancellation_reason, booking_id]
        );

        // Only restore seats if booking was CONFIRMED
        if (booking.status === 'CONFIRMED') {
            const rideResult = await client.query(
                `SELECT available_seats FROM rides 
                 WHERE id = $1 FOR UPDATE`,
                [booking.ride_id]
            );

            const newAvailable = rideResult.rows[0].available_seats + booking.seats_booked;

            await client.query(
                `UPDATE rides SET
                    available_seats = $1,
                    status = CASE WHEN status = 'FULL' THEN 'ACTIVE' ELSE status END,
                    updated_at = NOW()
                 WHERE id = $2`,
                [newAvailable, booking.ride_id]
            );
        }

        await client.query('COMMIT');

        const updated = await pool.query(
            `SELECT * FROM bookings WHERE id = $1`,
            [booking_id]
        );

        return updated.rows[0];

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};