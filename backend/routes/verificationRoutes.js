import express from 'express';
import { 
    applyForVerification,
    getVerificationStatus,
    getAllVerificationsAdmin,
    getPendingVerificationsAdmin,
    approveVerificationAdmin,
    rejectVerificationAdmin
} from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { validateVerification } from '../middleware/validator.js';

const router = express.Router();

// User routes
router.post('/apply', protect, validateVerification, applyForVerification);
router.get('/status', protect, getVerificationStatus);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllVerificationsAdmin);
router.get('/admin/pending', protect, adminOnly, getPendingVerificationsAdmin);
router.put('/admin/:id/approve', protect, adminOnly, approveVerificationAdmin);
router.put('/admin/:id/reject', protect, adminOnly, rejectVerificationAdmin);

export default router;