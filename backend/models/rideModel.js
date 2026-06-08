import pool from '../config/db.js';

// Create a new ride
export const createRide = async (rideData) => {
    const {
        driver_id,
        vehicle_id,
        origin,
        destination,
        origin_lat,
        origin_lng,
        destination_lat,
        destination_lng,
        departure_time,
        estimated_duration,
        total_seats,
        total_trip_cost,
        description
    } = rideData;

const price_per_seat = parseFloat(total_trip_cost) / (parseInt(total_seats) + 1);
    const result = await pool.query(
        `INSERT INTO rides (
            driver_id, vehicle_id, origin, destination,
            origin_lat, origin_lng, destination_lat, destination_lng,
            departure_time, estimated_duration, total_seats,
            available_seats, total_trip_cost, price_per_seat,
            description, status
        ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7, $8,
            $9, $10, $11,
            $11, $12, $13,
            $14, 'ACTIVE'
        ) RETURNING *`,
        [
            driver_id, vehicle_id, origin, destination,
            origin_lat, origin_lng, destination_lat, destination_lng,
            departure_time, estimated_duration, total_seats,
            total_trip_cost, price_per_seat, description
        ]
    );

    return result.rows[0];
};

// Get single ride by ID
export const getRideById = async (id) => {
    const result = await pool.query(
        `SELECT r.*,
                u.name AS driver_name, u.avg_rating, u.profile_pic,
                v.vehicle_name, v.vehicle_type, v.vehicle_number, v.color
         FROM rides r
         JOIN users u ON r.driver_id = u.id
         JOIN vehicles v ON r.vehicle_id = v.id
         WHERE r.id = $1`,
        [id]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const waypoints = await pool.query(
        `SELECT * FROM ride_waypoints 
         WHERE ride_id = $1 
         ORDER BY stop_order ASC`,
        [id]
    );

    return {
        ...result.rows[0],
        waypoints: waypoints.rows
    };
};

// Search rides
export const searchRides = async (origin, destination, date, seats) => {
    const result = await pool.query(
        `SELECT DISTINCT r.*,
                u.name AS driver_name, u.avg_rating, u.profile_pic,
                v.vehicle_name, v.vehicle_type, v.vehicle_number
         FROM rides r
         JOIN users u ON r.driver_id = u.id
         JOIN vehicles v ON r.vehicle_id = v.id
         LEFT JOIN ride_waypoints rw ON r.id = rw.ride_id
         WHERE r.status = 'ACTIVE'
           AND r.available_seats >= $1
           AND DATE(r.departure_time) = $2
           AND (
               LOWER(r.origin) LIKE LOWER('%' || $3 || '%')
               OR LOWER(rw.location_name) LIKE LOWER('%' || $3 || '%')
           )
           AND (
               LOWER(r.destination) LIKE LOWER('%' || $4 || '%')
               OR LOWER(rw.location_name) LIKE LOWER('%' || $4 || '%')
           )
         ORDER BY r.departure_time ASC`,
        [seats, date, origin, destination]
    );

    return result.rows;
};

// Get all rides posted by a driver
export const getMyRides = async (driver_id) => {
    const result = await pool.query(
        `SELECT r.*,
                v.vehicle_name, v.vehicle_type, v.vehicle_number
         FROM rides r
         JOIN vehicles v ON r.vehicle_id = v.id
         WHERE r.driver_id = $1
         ORDER BY r.departure_time DESC`,
        [driver_id]
    );

    return result.rows;
};

// Update a ride
export const updateRide = async (id, rideData) => {
    const {
        origin,
        destination,
        origin_lat,
        origin_lng,
        destination_lat,
        destination_lng,
        departure_time,
        estimated_duration,
        total_seats,
        total_trip_cost,
        description
    } = rideData;

    const price_per_seat = parseFloat(total_trip_cost) / (parseInt(total_seats) + 1);

    const result = await pool.query(
        `UPDATE rides SET
            origin = $1,
            destination = $2,
            origin_lat = $3,
            origin_lng = $4,
            destination_lat = $5,
            destination_lng = $6,
            departure_time = $7,
            estimated_duration = $8,
            total_seats = $9,
            total_trip_cost = $10,
            price_per_seat = $11,
            description = $12,
            updated_at = NOW()
         WHERE id = $13
         RETURNING *`,
        [
            origin,
            destination,
            origin_lat,
            origin_lng,
            destination_lat,
            destination_lng,
            departure_time,
            estimated_duration,
            total_seats,
            total_trip_cost,
            price_per_seat,
            description,
            id
        ]
    );

    return result.rows[0];
};

// Cancel a ride
export const cancelRide = async (id) => {
    const result = await pool.query(
        `UPDATE rides SET
            status = 'CANCELLED',
            updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
    );

    return result.rows[0];
};

// Add waypoints to a ride
export const addWaypoints = async (ride_id, waypoints) => {
    // Delete existing waypoints first
    await pool.query(
        `DELETE FROM ride_waypoints WHERE ride_id = $1`,
        [ride_id]
    );

    // Insert new waypoints one by one
    const inserted = [];

    for (const [index, wp] of waypoints.entries()) {
        const result = await pool.query(
            `INSERT INTO ride_waypoints 
                (ride_id, location_name, lat, lng, stop_order)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [ride_id, wp.location_name, wp.lat, wp.lng, index + 1]
        );
        inserted.push(result.rows[0]);
    }

    return inserted;
};

// Check if ride has any confirmed bookings
export const hasConfirmedBookings = async (ride_id) => {
    const result = await pool.query(
        `SELECT COUNT(*) FROM bookings
         WHERE ride_id = $1 AND status = 'CONFIRMED'`,
        [ride_id]
    );

    return parseInt(result.rows[0].count) > 0;
};
