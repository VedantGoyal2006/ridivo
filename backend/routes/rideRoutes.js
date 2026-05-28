import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createRide,
    searchRides,
    getMyRides,
    getRideById,
    updateRide,
    deleteRide,
    addWaypoints
} from '../controllers/rideController.js';

const router = express.Router();

// ⚠️ IMPORTANT RULE
// Specific named routes MUST come before /:id routes
// Otherwise Express thinks 'search' and 'my-rides' are IDs

router.get('/search', searchRides);
router.get('/my-rides', protect, getMyRides);

router.post('/', protect, createRide);
router.get('/:id', getRideById);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, deleteRide);
router.post('/:id/waypoints', protect, addWaypoints);

export default router;