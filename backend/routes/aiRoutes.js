import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { suggestPrice, calculateWaypointDistances } from '../controllers/aiController.js';

const router = express.Router();

router.post('/suggest-price', protect, suggestPrice);
router.post('/waypoint-distances', protect, calculateWaypointDistances);

export default router;