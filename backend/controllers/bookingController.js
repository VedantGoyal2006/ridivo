import pool from '../config/db.js';
import twilio from 'twilio';
import { decryptOTP } from '../utils/otpHelper.js';
import { refundBookingPayment } from './paymentController.js';
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

        if (!['PENDING', 'CONFIRMED', 'RESERVED', 'PAID'].includes(booking.status)) {
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

        // Issue automated refund if booking was already paid
        if (booking.status === 'PAID') {
            await refundBookingPayment(booking.id);
        }

        // Notify driver in real-time
        await sendNotification(
            booking.driver_id,
            "Booking Cancelled",
            `${req.user.name} cancelled their booking of ${booking.seats_booked} seat(s) for your ride from ${booking.origin} to ${booking.destination}.`,
            "BOOKING",
            booking.id
        );

        return res.status(200).json({
            message: 'Booking cancelled successfully. Refund initiated if paid.',
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
                    v.color AS vehicle_color, v.vehicle_name, v.vehicle_number,
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

        // 3. Verify booking status is STARTED (only active journeys can trigger SOS!)
        if (booking.booking_status !== 'STARTED') {
            return res.status(400).json({ message: 'SOS can only be sent for active (STARTED) journeys.' });
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

        // Set sos_active = TRUE on this booking
        await pool.query(
            `UPDATE bookings SET sos_active = TRUE, updated_at = NOW() WHERE id = $1`,
            [booking.booking_id]
        );

        // 5. Integrate Twilio SMS
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        
        const trackingLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/track-sos/${booking.booking_id}`;
        
        const alertMessage = 
`🚨 EMERGENCY ALERT FROM RIDIVO 🚨
Passenger: ${booking.passenger_name} needs urgent help!
Driver: ${booking.driver_name}
Vehicle: ${booking.vehicle_color || ''} ${booking.vehicle_name || ''} (${booking.vehicle_number || ''})
Trip: ${booking.origin} → ${booking.destination}
Live Tracking Map: ${trackingLink}`;

        let twilioDispatched = false;

        if (twilioSid && twilioToken && twilioPhone && twilioSid !== 'your_twilio_sid') {
            const client = twilio(twilioSid, twilioToken);
            for (const contact of contacts) {
                try {
                    await client.messages.create({
                        body: alertMessage,
                        from: twilioPhone,
                        to: contact.phone
                    });
                } catch (e) {
                    console.error(`Twilio SMS dispatch failed to ${contact.phone}:`, e.message);
                }
            }
            twilioDispatched = true;
        }

        // 6. Simulator fallback
        console.log('\n==================================================');
        console.log(`SOS ALERT TRIGGERED BY USER: ${booking.passenger_name} (ID: ${req.user.id})`);
        console.log(`Active Booking ID: ${booking.booking_id}`);
        console.log(`SMS Dispatched: ${twilioDispatched ? 'YES (Twilio API)' : 'NO (Sandbox Simulation)'}`);
        console.log('--------------------------------------------------');
        contacts.forEach((contact, idx) => {
            console.log(`[SMS DISPATCH] To: ${contact.phone} (${contact.name} - ${contact.relationship})`);
            console.log('Message:');
            console.log(alertMessage);
            console.log('--------------------------------------------------');
        });
        console.log('==================================================\n');

        return res.status(200).json({
            message: twilioDispatched 
                ? `Emergency alert successfully dispatched via Twilio to ${contacts.length} contact(s).`
                : `Emergency alert simulated successfully to ${contacts.length} contact(s) (Sandbox Mode).`,
            alertText: alertMessage
        });

    } catch (err) {
        console.error('triggerSOS error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/bookings/:id/sos/public-details (No auth required!)
export const getPublicSOSDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const bookingQuery = await pool.query(
            `SELECT b.id AS booking_id, b.status AS booking_status, b.seats_booked,
                    u_pass.name AS passenger_name,
                    r.id AS ride_id, r.origin, r.destination, r.origin_lat, r.origin_lng,
                    r.destination_lat, r.destination_lng, r.departure_time, r.status AS ride_status,
                    u_driver.name AS driver_name,
                    v.vehicle_name, v.vehicle_number, v.color AS vehicle_color, v.vehicle_type
             FROM bookings b
             JOIN users u_pass ON b.traveler_id = u_pass.id
             JOIN rides r ON b.ride_id = r.id
             JOIN users u_driver ON r.driver_id = u_driver.id
             LEFT JOIN vehicles v ON r.vehicle_id = v.id
             WHERE b.id = $1`,
            [id]
        );

        if (bookingQuery.rows.length === 0) {
            return res.status(404).json({ message: 'SOS tracking record not found.' });
        }

        const booking = bookingQuery.rows[0];

        // Security check: Only return details if booking is active (STARTED)
        if (booking.booking_status !== 'STARTED') {
            return res.status(400).json({ message: 'Safety tracking is not active for this trip.' });
        }

        return res.status(200).json({
            message: 'SOS details retrieved successfully',
            details: booking
        });

    } catch (err) {
        console.error('getPublicSOSDetails error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/bookings/:id/verify-otp
export const verifyBookingOTP = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ message: 'OTP code is required' });
        }

        await client.query('BEGIN');

        // 1. Lock and fetch booking details
        const bookingResult = await client.query(
            `SELECT b.*, r.driver_id, r.status AS ride_status 
             FROM bookings b
             JOIN rides r ON b.ride_id = r.id
             WHERE b.id = $1 FOR UPDATE`,
            [id]
        );

        if (bookingResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Booking request not found' });
        }

        const booking = bookingResult.rows[0];

        // 2. Security validation: only the driver of this ride can verify the traveler's OTP
        if (booking.driver_id !== req.user.id) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Access denied. Only the ride creator can verify OTP.' });
        }

        // 3. Status validation: booking must be CONFIRMED or PAID
        if (!['CONFIRMED', 'PAID', 'RESERVED'].includes(booking.status)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: `Invalid boarding state. Booking is currently ${booking.status}.` });
        }

        // 4. Expiration check
        if (new Date(booking.otp_expires_at) < new Date()) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'OTP has expired. Please request a new verification code.' });
        }

        // 5. Decrypt and verify matching value
        const decrypted = decryptOTP(booking.otp_hash);
        if (decrypted !== otp.toString()) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Incorrect OTP code. Please check and try again.' });
        }

        // 6. OTP correct: transition booking status to STARTED
        await client.query(
            `UPDATE bookings SET status = 'STARTED', updated_at = NOW() WHERE id = $1`,
            [id]
        );

        // 7. If the ride is not already ONGOING or ARRIVED/ACTIVE, transition ride status to ONGOING
        await client.query(
            `UPDATE rides SET status = 'ONGOING', updated_at = NOW() WHERE id = $1`,
            [booking.ride_id]
        );

        await client.query('COMMIT');

        // Send notifications to passenger
        await sendNotification(
            booking.traveler_id,
            "Boarding Verified",
            "Your OTP has been successfully verified! Enjoy your journey.",
            "RIDE",
            booking.id
        );

        return res.status(200).json({
            message: 'OTP verified successfully. Boarding complete.',
            booking_status: 'STARTED'
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('verifyOTP error:', err);
        return res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};