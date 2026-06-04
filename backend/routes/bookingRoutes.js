import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateBooking } from '../middleware/validator.js';
import {
    createBooking,
    getMyBookings,
    getBookingsForRide,
    acceptBooking,
    rejectBooking,
    cancelBooking
} from '../controllers/bookingController.js';

const router = express.Router();

// All booking routes need login
router.post('/', protect, validateBooking, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/ride/:rideId', protect, getBookingsForRide);
router.put('/:id/accept', protect, acceptBooking);
router.put('/:id/reject', protect, rejectBooking);
router.put('/:id/cancel', protect, cancelBooking);

export default router;