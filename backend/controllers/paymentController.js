import crypto from 'crypto';
import Razorpay from 'razorpay';
import pool from '../config/db.js';
import { sendNotification } from '../utils/notificationHelper.js';

// Setup Razorpay client. Handles sandbox fallback gracefully
const getRazorpayClient = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'your_razorpay_key_id') {
        return null; // Sandbox simulated mode
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
};

// POST /api/payments/order
export const createOrder = async (req, res) => {
    try {
        const { booking_id } = req.body;

        if (!booking_id) {
            return res.status(400).json({ message: 'booking_id is required' });
        }

        // 1. Fetch booking details
        const bookingQuery = await pool.query(
            `SELECT b.*, r.origin, r.destination 
             FROM bookings b
             JOIN rides r ON b.ride_id = r.id
             WHERE b.id = $1`,
            [booking_id]
        );

        if (bookingQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const booking = bookingQuery.rows[0];

        // 2. Validate booking ownership
        if (booking.traveler_id !== req.user.id) {
            return res.status(403).json({ message: 'Access denied. You do not own this booking.' });
        }

        // 3. Check booking status
        if (!['CONFIRMED', 'RESERVED'].includes(booking.status)) {
            return res.status(400).json({ message: `Cannot pay for booking in status ${booking.status}` });
        }

        const amountPaise = Math.round(booking.total_fare * 100);

        const razorpay = getRazorpayClient();
        let orderId = '';
        let isSandbox = false;

        if (!razorpay) {
            // Simulated Sandbox order ID
            orderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;
            isSandbox = true;
        } else {
            const order = await razorpay.orders.create({
                amount: amountPaise,
                currency: 'INR',
                receipt: `rcpt_booking_${booking.id}`
            });
            orderId = order.id;
        }

        // 4. Save pending payment record in DB
        await pool.query(
            `INSERT INTO payments 
                (booking_id, traveler_id, razorpay_order_id, amount, status)
             VALUES ($1, $2, $3, $4, 'PENDING')
             ON CONFLICT (booking_id) 
             DO UPDATE SET razorpay_order_id = EXCLUDED.razorpay_order_id, amount = EXCLUDED.amount, status = 'PENDING'`,
            [booking.id, req.user.id, orderId, booking.total_fare]
        );

        return res.status(200).json({
            message: 'Razorpay order created successfully',
            order_id: orderId,
            amount: booking.total_fare,
            currency: 'INR',
            key_id: process.env.RAZORPAY_KEY_ID || 'sandbox_key',
            is_sandbox: isSandbox
        });

    } catch (err) {
        console.error('createOrder error:', err);
        return res.status(500).json({ message: 'Server error creating checkout order' });
    }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res) => {
    const client = await pool.connect();
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({ message: 'Missing payment signature verification parameters' });
        }

        // 1. Verify payment signature
        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        let isSignatureValid = false;

        if (!keyId || !keySecret || keyId === 'your_razorpay_key_id') {
            // Sandbox validation rules
            isSignatureValid = razorpay_order_id.startsWith('mock_order_');
        } else {
            const generated = crypto
                .createHmac('sha256', keySecret)
                .update(razorpay_order_id + '|' + razorpay_payment_id)
                .digest('hex');
            isSignatureValid = generated === razorpay_signature;
        }

        if (!isSignatureValid) {
            return res.status(400).json({ message: 'Invalid payment signature. Audit check failed.' });
        }

        await client.query('BEGIN');

        // 2. Fetch and lock payment record
        const paymentQuery = await client.query(
            `SELECT * FROM payments WHERE razorpay_order_id = $1 FOR UPDATE`,
            [razorpay_order_id]
        );

        if (paymentQuery.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Payment record not found' });
        }

        const payment = paymentQuery.rows[0];

        // 3. Update payment status to SUCCESS
        await client.query(
            `UPDATE payments SET
                razorpay_payment_id = $1,
                razorpay_signature = $2,
                status = 'SUCCESS',
                paid_at = NOW()
             WHERE id = $3`,
            [razorpay_payment_id, razorpay_signature || 'mock_sig', payment.id]
        );

        // 4. Update booking status to PAID
        const bookingQuery = await client.query(
            `UPDATE bookings SET status = 'PAID', updated_at = NOW() 
             WHERE id = $1 
             RETURNING *`,
            [payment.booking_id]
        );

        const booking = bookingQuery.rows[0];

        // Fetch ride details to notify driver
        const rideQuery = await client.query(
            `SELECT driver_id, origin, destination FROM rides WHERE id = $1`,
            [booking.ride_id]
        );
        const ride = rideQuery.rows[0];

        await client.query('COMMIT');

        // Send notifications
        await sendNotification(
            booking.traveler_id,
            "Payment Confirmed",
            `Your payment of ₹${Math.round(payment.amount)} for the trip to ${ride.destination} has been verified successfully.`,
            "PAYMENT",
            booking.id
        );

        await sendNotification(
            ride.driver_id,
            "Seat Paid & Booked",
            `Co-traveler payment completed! Seat is fully reserved for your trip to ${ride.destination}.`,
            "PAYMENT",
            booking.id
        );

        return res.status(200).json({
            message: 'Payment verified and verified successfully',
            status: 'SUCCESS'
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('verifyPayment error:', err);
        return res.status(500).json({ message: 'Server error verifying payment' });
    } finally {
        client.release();
    }
};

// POST /api/payments/webhook
export const handleWebhook = async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // We reply with 200 status code to acknowledge receipt quickly
    res.status(200).json({ status: 'ok' });

    try {
        const signature = req.headers['x-razorpay-signature'];
        if (webhookSecret && signature) {
            // Verify webhook signature
            const shasum = crypto.createHmac('sha256', webhookSecret);
            shasum.update(JSON.stringify(req.body));
            const digest = shasum.digest('hex');
            if (digest !== signature) {
                console.error("Webhook signature verification failed");
                return;
            }
        }

        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'payment.captured') {
            const paymentId = payload.payment.entity.id;
            const orderId = payload.payment.entity.order_id;
            
            // Asynchronous fallback: update payment record status to SUCCESS if still PENDING
            const paymentCheck = await pool.query(
                `SELECT * FROM payments WHERE razorpay_order_id = $1`,
                [orderId]
            );

            if (paymentCheck.rows.length > 0 && paymentCheck.rows[0].status === 'PENDING') {
                const payment = paymentCheck.rows[0];
                const client = await pool.connect();
                try {
                    await client.query('BEGIN');
                    await client.query(
                        `UPDATE payments SET razorpay_payment_id = $1, status = 'SUCCESS', paid_at = NOW() WHERE id = $2`,
                        [paymentId, payment.id]
                    );
                    await client.query(
                        `UPDATE bookings SET status = 'PAID', updated_at = NOW() WHERE id = $1`,
                        [payment.booking_id]
                    );
                    await client.query('COMMIT');
                } catch (e) {
                    await client.query('ROLLBACK');
                    console.error("Webhook payment process error:", e);
                } finally {
                    client.release();
                }
            }
        }
    } catch (err) {
        console.error('Payment webhook error:', err);
    }
};

/**
 * Refund dispatch helper called when bookings are cancelled
 */
export const refundBookingPayment = async (bookingId, clientConnection = null) => {
    const db = clientConnection || pool;
    try {
        const paymentQuery = await db.query(
            `SELECT * FROM payments WHERE booking_id = $1 AND status = 'SUCCESS'`,
            [bookingId]
        );

        if (paymentQuery.rows.length === 0) return false; // Not paid

        const payment = paymentQuery.rows[0];
        const razorpay = getRazorpayClient();
        let refundId = `mock_refund_${crypto.randomBytes(8).toString('hex')}`;

        if (razorpay && payment.razorpay_payment_id && !payment.razorpay_payment_id.startsWith('mock_')) {
            const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
                amount: Math.round(payment.amount * 100)
            });
            refundId = refund.id;
        }

        // Insert refund record
        await db.query(
            `INSERT INTO refunds 
                (payment_id, booking_id, razorpay_refund_id, refund_amount, status, reason)
             VALUES ($1, $2, $3, $4, 'SUCCESS', 'Booking cancellation refund')`,
            [payment.id, bookingId, refundId, payment.amount]
        );

        // Update payment row
        await db.query(
            `UPDATE payments SET status = 'REFUNDED' WHERE id = $1`,
            [payment.id]
        );

        return true;
    } catch (err) {
        console.error("Failed to refund payment:", err);
        return false;
    }
};
