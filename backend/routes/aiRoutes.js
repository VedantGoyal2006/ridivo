import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
<<<<<<< HEAD
import { suggestPrice, calculateWaypointDistances } from '../controllers/aiController.js';
=======
import { suggestPrice } from '../controllers/aiController.js';
>>>>>>> main

const router = express.Router();

router.post('/suggest-price', protect, suggestPrice);
<<<<<<< HEAD
router.post('/waypoint-distances', protect, calculateWaypointDistances);
=======
>>>>>>> main

export default router;