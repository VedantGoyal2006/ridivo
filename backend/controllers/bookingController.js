import pool from '../config/db.js';
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
import { sendNotification } from '../utils/notificationHelper.js';

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

        // Send notification to the driver in real-time
        await sendNotification(
            ride.driver_id,
            "New Booking Request",
            `${req.user.name} requested ${seats_booked} seat(s) for your ride from ${ride.origin} to ${ride.destination}.`,
            "BOOKING",
            booking.id
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

        // Notify traveler in real-time
        await sendNotification(
            booking.traveler_id,
            "Booking Request Accepted",
            `${req.user.name} accepted your booking request from ${booking.origin} to ${booking.destination}.`,
            "BOOKING",
            booking.id
        );

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

        // Notify traveler in real-time
        await sendNotification(
            booking.traveler_id,
            "Booking Request Rejected",
            `${req.user.name} declined your booking request from ${booking.origin} to ${booking.destination}.`,
            "BOOKING",
            booking.id
        );

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

        // Notify driver in real-time
        await sendNotification(
            booking.driver_id,
            "Booking Cancelled",
            `${req.user.name} cancelled their booking of ${booking.seats_booked} seat(s) for your ride from ${booking.origin} to ${booking.destination}.`,
            "BOOKING",
            booking.id
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

// POST /api/bookings/:id/sos
export const triggerSOS = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get the booking and join to get all required details
        const bookingQuery = await pool.query(
            `SELECT b.id AS booking_id, b.status AS booking_status, b.traveler_id,
                    u_pass.name AS passenger_name,
                    r.origin, r.destination, r.departure_time, r.status AS ride_status,
                    u_driver.name AS driver_name, u_driver.id AS driver_id,
                    v.color AS vehicle_color, v.vehicle_number,
                    dv.aadhar_number AS driver_aadhar
             FROM bookings b
             JOIN users u_pass ON b.traveler_id = u_pass.id
             JOIN rides r ON b.ride_id = r.id
             JOIN users u_driver ON r.driver_id = u_driver.id
             LEFT JOIN vehicles v ON r.vehicle_id = v.id
             LEFT JOIN driver_verifications dv ON r.driver_id = dv.user_id
             WHERE b.id = $1`,
            [id]
        );

        if (bookingQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookingQuery.rows[0];

        // 2. Check that the booking belongs to the logged-in user
        if (booking.traveler_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. This is not your booking.' });
        }

        // 3. Verify booking status is CONFIRMED
        if (booking.booking_status !== 'CONFIRMED') {
            return res.status(400).json({ message: 'SOS can only be sent for CONFIRMED bookings.' });
        }

        // 4. Fetch the user's emergency contacts
        const contactsQuery = await pool.query(
            `SELECT name, relationship, phone FROM emergency_contacts WHERE user_id = $1`,
            [req.user.id]
        );

        const contacts = contactsQuery.rows;
        if (contacts.length === 0) {
            return res.status(400).json({
                message: 'No emergency contacts found. Please add emergency contacts in your Profile first.'
            });
        }

        // 5. Format the emergency message
        const formattedDepartureTime = new Date(booking.departure_time).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });

        const alertMessage = 
`🚨 EMERGENCY ALERT FROM RIDIVO 🚨

Passenger: ${booking.passenger_name}

Driver: ${booking.driver_name}
Driver Aadhar Card: ${booking.driver_aadhar || 'N/A'}

Vehicle: ${booking.vehicle_color || 'N/A'}
Vehicle Number: ${booking.vehicle_number || 'N/A'}

Trip:
${booking.origin} → ${booking.destination}

Ride Started At:
${formattedDepartureTime}`;

        // 6. Simulate SMS dispatch by logging to console
        console.log('\n==================================================');
        console.log(`SOS ALERT TRIGGERED BY USER: ${booking.passenger_name} (ID: ${req.user.id})`);
        console.log(`Active Booking ID: ${booking.booking_id}`);
        console.log('--------------------------------------------------');
        contacts.forEach((contact, idx) => {
            console.log(`[SMS DISPATCH] To: ${contact.phone} (${contact.name} - ${contact.relationship})`);
            console.log('Message:');
            console.log(alertMessage);
            console.log('--------------------------------------------------');
        });
        console.log('==================================================\n');

        return res.status(200).json({
            message: `Emergency alert successfully dispatched to ${contacts.length} contact(s).`,
            alertText: alertMessage
        });

    } catch (err) {
        console.error('triggerSOS error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};