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

// Haversine distance calculator helper (in km)
const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Search rides
export const searchRides = async (origin, destination, date, seats, latLngs = null) => {
    // 1. Fetch candidates matching date and seat criteria
    const candidatesResult = await pool.query(
        `SELECT r.*,
                u.name AS driver_name, u.avg_rating, u.profile_pic,
                v.vehicle_name, v.vehicle_type, v.vehicle_number
         FROM rides r
         JOIN users u ON r.driver_id = u.id
         JOIN vehicles v ON r.vehicle_id = v.id
         WHERE r.status = 'ACTIVE'
           AND r.available_seats >= $1
           AND r.departure_time >= $2::TIMESTAMP
           AND r.departure_time <= $2::TIMESTAMP + INTERVAL '3 days'`,
        [seats, date]
    );

    const candidates = candidatesResult.rows;

    // 2. Fetch all waypoints for these candidates
    const rideIds = candidates.map(c => c.id);
    let waypointsMap = {};
    if (rideIds.length > 0) {
        const wpResult = await pool.query(
            `SELECT * FROM ride_waypoints 
             WHERE ride_id = ANY($1) 
             ORDER BY stop_order ASC`,
            [rideIds]
        );
        wpResult.rows.forEach(wp => {
            if (!waypointsMap[wp.ride_id]) waypointsMap[wp.ride_id] = [];
            waypointsMap[wp.ride_id].push(wp);
        });
    }

    // 3. Coordinate-based smart scoring
    if (latLngs && latLngs.origin_lat && latLngs.origin_lng && latLngs.destination_lat && latLngs.destination_lng) {
        const { origin_lat, origin_lng, destination_lat, destination_lng } = latLngs;
        
        const scoredRides = candidates.map(ride => {
            const rideWps = waypointsMap[ride.id] || [];
            
            // Build the full sequential path of coordinates
            // Index 0: Origin, Index 1 to N: Waypoints, Index N+1: Destination
            const path = [
                { lat: parseFloat(ride.origin_lat), lng: parseFloat(ride.origin_lng), stop_order: 0, location_name: ride.origin },
                ...rideWps.map(wp => ({ lat: parseFloat(wp.lat), lng: parseFloat(wp.lng), stop_order: wp.stop_order, location_name: wp.location_name })),
                { lat: parseFloat(ride.destination_lat), lng: parseFloat(ride.destination_lng), stop_order: rideWps.length + 1, location_name: ride.destination }
            ];

            // Find closest pickup segment along the path
            let bestPickupIdx = 0;
            let minPickupDist = 9999;
            path.forEach((pt, idx) => {
                const dist = getDistance(origin_lat, origin_lng, pt.lat, pt.lng);
                if (dist < minPickupDist) {
                    minPickupDist = dist;
                    bestPickupIdx = idx;
                }
            });

            // Find closest dropoff segment along the path (only considering segments at or after bestPickupIdx to match direction)
            let bestDropoffIdx = path.length - 1;
            let minDropoffDist = 9999;
            for (let i = bestPickupIdx; i < path.length; i++) {
                const dist = getDistance(destination_lat, destination_lng, path[i].lat, path[i].lng);
                if (dist < minDropoffDist) {
                    minDropoffDist = dist;
                    bestDropoffIdx = i;
                }
            }

            // Direction verification: Check if dropoff is after pickup
            // If they are on the same index, it means it's a very short overlap (deviation checks will penalize if not matching)
            const sameStop = bestPickupIdx === bestDropoffIdx;
            const correctDirection = bestPickupIdx < bestDropoffIdx;

            // Score Calculation
            let score = 100;

            // Penalty for distance deviation from search points to ride path (max 50 points penalty)
            const pickupDeviationPenalty = Math.min(minPickupDist * 8, 30);
            const dropoffDeviationPenalty = Math.min(minDropoffDist * 8, 30);
            score -= (pickupDeviationPenalty + dropoffDeviationPenalty);

            // Time difference penalty (hours difference between searched departure and actual, max 30 points penalty)
            const searchTime = new Date(date).getTime();
            const rideTime = new Date(ride.departure_time).getTime();
            const diffHours = Math.abs(searchTime - rideTime) / (1000 * 60 * 60);
            const timePenalty = Math.min(diffHours * 1.5, 20);
            score -= timePenalty;

            // Incentivize high driver ratings
            const driverRating = parseFloat(ride.avg_rating) || 0;
            score += (driverRating * 2.5);

            // Incentivize seat availability
            const seatsIncentive = Math.min(ride.available_seats * 1.5, 6);
            score += seatsIncentive;

            // Direction penalties
            if (!correctDirection && !sameStop) {
                score -= 60; // Huge penalty for wrong travel direction
            }

            return {
                ...ride,
                waypoints: rideWps,
                match_score: Math.max(Math.round(score), 0),
                pickup_deviation_km: Math.round(minPickupDist * 10) / 10,
                dropoff_deviation_km: Math.round(minDropoffDist * 10) / 10,
            };
        });

        // Filter out completely mismatched directions (score under 30) and sort by score descending
        return scoredRides
            .filter(r => r.match_score >= 35 && r.pickup_deviation_km <= 5 && r.dropoff_deviation_km <= 5)
            .sort((a, b) => b.match_score - a.match_score);
    }

    // 4. Text-based query fallback if coordinates are missing
    const filteredTextRides = candidates.filter(ride => {
        const originMatch = ride.origin.toLowerCase().includes(origin.toLowerCase());
        const destMatch = ride.destination.toLowerCase().includes(destination.toLowerCase());
        
        const wps = waypointsMap[ride.id] || [];
        const wpMatch = wps.some(wp => 
            wp.location_name.toLowerCase().includes(origin.toLowerCase()) || 
            wp.location_name.toLowerCase().includes(destination.toLowerCase())
        );

        return originMatch || destMatch || wpMatch;
    }).map(ride => ({
        ...ride,
        waypoints: waypointsMap[ride.id] || [],
        match_score: 85 // Static high score for clean text matches
    }));

    return filteredTextRides.sort((a, b) => new Date(a.departure_time) - new Date(b.departure_time));
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

// Complete a ride
export const completeRide = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update the ride status
        const rideResult = await client.query(
            `UPDATE rides SET
                status = 'COMPLETED',
                updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        // 2. Update all active bookings for this ride to COMPLETED
        await client.query(
            `UPDATE bookings SET
                status = 'COMPLETED',
                updated_at = NOW()
             WHERE ride_id = $1 AND status IN ('CONFIRMED', 'PAID', 'RESERVED', 'STARTED')`,
            [id]
        );

        await client.query('COMMIT');
        return rideResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Arrive at pickup (driver action)
export const arriveAtPickup = async (id) => {
    const result = await pool.query(
        `UPDATE rides SET
            status = 'ARRIVED',
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
         WHERE ride_id = $1 AND status IN ('CONFIRMED', 'PAID', 'RESERVED', 'STARTED')`,
        [ride_id]
    );

    return parseInt(result.rows[0].count) > 0;
};
