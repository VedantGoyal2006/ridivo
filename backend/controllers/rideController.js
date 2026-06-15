import pool from '../config/db.js';
import {
    createRide as createRideInDB,
    getRideById as getRideFromDB,
    searchRides as searchRidesInDB,
    getMyRides as getMyRidesFromDB,
    updateRide as updateRideInDB,
    cancelRide as cancelRideInDB,
    completeRide as completeRideInDB,
    addWaypoints as addWaypointsInDB,
    hasConfirmedBookings
} from '../models/rideModel.js';
import { sendNotification } from '../utils/notificationHelper.js';

// POST /api/rides
export const createRide = async (req, res) => {
    try {
        // 1. Check driver is verified
        const verification = await pool.query(
            `SELECT status FROM driver_verifications 
             WHERE user_id = $1`,
            [req.user.id]
        );

        if (verification.rows.length === 0 || 
            verification.rows[0].status !== 'APPROVED') {
            return res.status(403).json({
                message: 'You must be a verified driver to post a ride'
            });
        }

        // 2. Check vehicle belongs to this driver
        const { vehicle_id } = req.body;

        const vehicle = await pool.query(
            `SELECT id FROM vehicles 
             WHERE id = $1 AND driver_id = $2`,
            [vehicle_id, req.user.id]
        );

        if (vehicle.rows.length === 0) {
            return res.status(403).json({
                message: 'Vehicle not found or does not belong to you'
            });
        }

        // 3. Create the ride
        const ride = await createRideInDB({
            driver_id: req.user.id,
            vehicle_id: req.body.vehicle_id,
            origin: req.body.origin,
            destination: req.body.destination,
            origin_lat: req.body.origin_lat,
            origin_lng: req.body.origin_lng,
            destination_lat: req.body.destination_lat,
            destination_lng: req.body.destination_lng,
            departure_time: req.body.departure_time,
            estimated_duration: req.body.estimated_duration,
            total_seats: req.body.total_seats,
            total_trip_cost: req.body.total_trip_cost,
            description: req.body.description
        });

        return res.status(201).json({
            message: 'Ride created successfully',
            ride
        });

    } catch (err) {
        console.error('createRide error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/rides/search
export const searchRides = async (req, res) => {
    try {
        // 1. Get search values from URL
        const { origin, destination, date, seats } = req.query;

        // 2. Check required fields
        if (!origin || !destination || !date) {
            return res.status(400).json({
                message: 'origin, destination and date are required'
            });
        }

        // 3. Search rides
        const rides = await searchRidesInDB(
            origin,
            destination,
            date,
            parseInt(seats) || 1
        );

        return res.status(200).json({
            message: 'Rides fetched successfully',
            rides
        });

    } catch (err) {
        console.error('searchRides error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/rides/my-rides
export const getMyRides = async (req, res) => {
    try {
        const rides = await getMyRidesFromDB(req.user.id);

        return res.status(200).json({
            message: 'Rides fetched successfully',
            rides
        });

    } catch (err) {
        console.error('getMyRides error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/rides/:id
export const getRideById = async (req, res) => {
    try {

        // 1. Get the ride ID from the URL
        // example: /api/rides/abc-123
        // req.params.id = "abc-123"
        const ride = await getRideFromDB(req.params.id);

        // 2. If model returned null means no ride found
        // send 404 error back
        if (!ride) {
            return res.status(404).json({
                message: 'Ride not found'
            });
        }

        // 3. Ride found, send it back
        return res.status(200).json({
            message: 'Ride fetched successfully',
            ride
        });

    } catch (err) {
        // 4. Something unexpected broke
        // print error in terminal for debugging
        // send 500 error back to user
        console.error('getRideById error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/rides/:id
export const updateRide = async (req, res) => {
    try {
        // 1. Get ride ID from URL
        const ride = await getRideFromDB(req.params.id);

        // 2. Check ride exists
        if (!ride) {
            return res.status(404).json({
                message: 'Ride not found'
            });
        }

        // 3. Check this driver owns this ride
        if (ride.driver_id !== req.user.id) {
            return res.status(403).json({
                message: 'You are not the driver of this ride'
            });
        }

        // 4. Check no confirmed bookings exist
        const hasConfirmed = await hasConfirmedBookings(req.params.id);

        if (hasConfirmed) {
            return res.status(400).json({
                message: 'Cannot edit ride that has confirmed bookings'
            });
        }

        // 5. Update the ride
        const updated = await updateRideInDB(req.params.id, req.body);

        return res.status(200).json({
            message: 'Ride updated successfully',
            ride: updated
        });

    } catch (err) {
        console.error('updateRide error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/rides/:id
export const deleteRide = async (req, res) => {
    try {
        // 1. Check ride exists
        const ride = await getRideFromDB(req.params.id);

        if (!ride) {
            return res.status(404).json({
                message: 'Ride not found'
            });
        }

        // 2. Check this driver owns this ride
        if (ride.driver_id !== req.user.id) {
            return res.status(403).json({
                message: 'You are not the driver of this ride'
            });
        }

        // 3. Check ride is not already cancelled or completed
        if (ride.status === 'CANCELLED' || ride.status === 'COMPLETED') {
            return res.status(400).json({
                message: 'This ride cannot be cancelled'
            });
        }

        // 4. Cancel the ride
        const cancelled = await cancelRideInDB(req.params.id);

        // Fetch travelers with confirmed bookings to notify them
        const bookingsResult = await pool.query(
            `SELECT traveler_id FROM bookings WHERE ride_id = $1 AND status = 'CONFIRMED'`,
            [req.params.id]
        );
        
        for (const booking of bookingsResult.rows) {
            await sendNotification(
                booking.traveler_id,
                "Ride Cancelled",
                `${req.user.name} cancelled the ride from ${ride.origin} to ${ride.destination}.`,
                "RIDE",
                ride.id
            );
        }

        return res.status(200).json({
            message: 'Ride cancelled successfully',
            ride: cancelled
        });

    } catch (err) {
        console.error('deleteRide error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/rides/:id/complete
export const completeRide = async (req, res) => {
    try {
        // 1. Check ride exists
        const ride = await getRideFromDB(req.params.id);

        if (!ride) {
            return res.status(404).json({
                message: 'Ride not found'
            });
        }

        // 2. Check this driver owns this ride
        if (ride.driver_id !== req.user.id) {
            return res.status(403).json({
                message: 'You are not the driver of this ride'
            });
        }

        // 3. Check ride is active
        if (ride.status !== 'ACTIVE') {
            return res.status(400).json({
                message: `This ride is ${ride.status.toLowerCase()} and cannot be completed`
            });
        }

        // 4. Complete the ride
        const completed = await completeRideInDB(req.params.id);

        // Fetch travelers with confirmed bookings to notify them
        const bookingsResult = await pool.query(
            `SELECT traveler_id FROM bookings WHERE ride_id = $1 AND status = 'CONFIRMED'`,
            [req.params.id]
        );
        
        for (const booking of bookingsResult.rows) {
            await sendNotification(
                booking.traveler_id,
                "Ride Completed",
                `Your ride from ${ride.origin} to ${ride.destination} with ${req.user.name} is complete. Please leave a review!`,
                "RIDE",
                ride.id
            );
        }

        return res.status(200).json({
            message: 'Ride completed successfully',
            ride: completed
        });

    } catch (err) {
        console.error('completeRide error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/rides/:id/waypoints
export const addWaypoints = async (req, res) => {
    try {
        // 1. Check ride exists
        const ride = await getRideFromDB(req.params.id);

        if (!ride) {
            return res.status(404).json({
                message: 'Ride not found'
            });
        }

        // 2. Check this driver owns this ride
        if (ride.driver_id !== req.user.id) {
            return res.status(403).json({
                message: 'You are not the driver of this ride'
            });
        }

        // 3. Check waypoints array exists in body
        const { waypoints } = req.body;

        if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
            return res.status(400).json({
                message: 'waypoints must be a non empty array'
            });
        }

        // 4. Add waypoints
        const inserted = await addWaypointsInDB(req.params.id, waypoints);

        return res.status(201).json({
            message: 'Waypoints added successfully',
            waypoints: inserted
        });

    } catch (err) {
        console.error('addWaypoints error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

