import {
    createBooking as createBookingInDB,
    getBookingsByTraveler as getBookingsByTravelerFromDB,
    getBookingsByRide as getBookingsByRideFromDB,
    getBookingById as getBookingFromDB,
    acceptBooking as acceptBookingInDB,
    rejectBooking as rejectBookingInDB,
    cancelBooking as cancelBookingInDB
} from '../models/bookingModel.js';
import { getRideById as getRideFromDB } from '../models/rideModel.js';

// POST /api/bookings
export const createBooking = async (req, res) => {
    try {
        const { ride_id, seats_booked, pickup_point, drop_point } = req.body;

        // 1. Check required fields
        if (!ride_id || !seats_booked) {
            return res.status(400).json({
                message: 'ride_id and seats_booked are required'
            });
        }

        // 2. Get ride details
        const ride = await getRideFromDB(ride_id);

        if (!ride) {
            return res.status(404).json({
                message: 'Ride not found'
            });
        }

        // 3. No self booking rule
        if (ride.driver_id === req.user.id) {
            return res.status(400).json({
                message: 'You cannot book your own ride'
            });
        }

        // 4. Check ride is active
        if (ride.status !== 'ACTIVE') {
            return res.status(400).json({
                message: 'This ride is not available for booking'
            });
        }

        // 5. Create booking
        const booking = await createBookingInDB(
            ride_id,
            req.user.id,
            parseInt(seats_booked),
            pickup_point,
            drop_point
        );

        return res.status(201).json({
            message: 'Booking request sent successfully',
            booking
        });

    } catch (err) {
        console.error('createBooking error:', err.message);

        // Show seat availability errors clearly
        if (err.message.includes('seat') || 
            err.message.includes('available') ||
            err.message.includes('not available')) {
            return res.status(400).json({ message: err.message });
        }

        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/bookings/my-bookings
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await getBookingsByTravelerFromDB(req.user.id);

        return res.status(200).json({
            message: 'Bookings fetched successfully',
            bookings
        });

    } catch (err) {
        console.error('getMyBookings error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/bookings/ride/:rideId
export const getBookingsForRide = async (req, res) => {
    try {
        const ride = await getRideFromDB(req.params.rideId);

        if (!ride) {
            return res.status(404).json({
                message: 'Ride not found'
            });
        }

        // Only driver of this ride can see its bookings
        if (ride.driver_id !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. You are not the driver of this ride'
            });
        }

        const bookings = await getBookingsByRideFromDB(req.params.rideId);

        return res.status(200).json({
            message: 'Bookings fetched successfully',
            bookings
        });

    } catch (err) {
        console.error('getBookingsForRide error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/bookings/:id/accept
export const acceptBooking = async (req, res) => {
    try {
        const booking = await getBookingFromDB(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        // Only driver of that ride can accept
        if (booking.driver_id !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. You are not the driver of this ride'
            });
        }

        if (booking.status !== 'PENDING') {
            return res.status(400).json({
                message: 'Only PENDING bookings can be accepted'
            });
        }

        const updated = await acceptBookingInDB(req.params.id);

        return res.status(200).json({
            message: 'Booking accepted successfully',
            booking: updated
        });

    } catch (err) {
        console.error('acceptBooking error:', err.message);

        if (err.message.includes('seat')) {
            return res.status(400).json({ message: err.message });
        }

        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/bookings/:id/reject
export const rejectBooking = async (req, res) => {
    try {
        const booking = await getBookingFromDB(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        // Only driver can reject
        if (booking.driver_id !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. You are not the driver of this ride'
            });
        }

        if (booking.status !== 'PENDING') {
            return res.status(400).json({
                message: 'Only PENDING bookings can be rejected'
            });
        }

        const updated = await rejectBookingInDB(req.params.id);

        return res.status(200).json({
            message: 'Booking rejected',
            booking: updated
        });

    } catch (err) {
        console.error('rejectBooking error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
    try {
        const booking = await getBookingFromDB(req.params.id);

        if (!booking) {
            return res.status(404).json({
                message: 'Booking not found'
            });
        }

        // Only the traveler who made booking can cancel
        if (booking.traveler_id !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. This is not your booking'
            });
        }

        if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
            return res.status(400).json({
                message: 'This booking cannot be cancelled'
            });
        }

        const { cancellation_reason } = req.body;

        const updated = await cancelBookingInDB(
            req.params.id,
            'TRAVELER',
            cancellation_reason || null
        );

        // TODO: if booking was CONFIRMED and payment made
        // trigger refund here (Shubham handles this part)

        return res.status(200).json({
            message: 'Booking cancelled successfully',
            booking: updated
        });

    } catch (err) {
        console.error('cancelBooking error:', err.message);

        if (err.message.includes('cannot be cancelled')) {
            return res.status(400).json({ message: err.message });
        }

        return res.status(500).json({ message: 'Server error' });
    }
};