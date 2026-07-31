import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createOrder, verifyPayment, handleWebhook } from '../controllers/paymentController.js';

const router = express.Router();

// Order creation & verify routes need auth token
router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

// Razorpay Webhook callback - no auth required (signatures verified within controller)
router.post('/webhook', handleWebhook);

export default router;
