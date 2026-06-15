import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getNotifications, markAllRead, markRead } from '../controllers/notificationController.js';

const router = express.Router();

// All routes are protected
router.get('/', protect, getNotifications);
router.put('/mark-all-read', protect, markAllRead);
router.put('/:id/read', protect, markRead);

export default router;
