import express from 'express';
import {
    addVehicle,
    getMyVehicles,
    makeVehicleActive,
    removeVehicle,
    editVehicle
} from '../controllers/vehicleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateVehicle } from '../middleware/validator.js';

const router = express.Router();

router.post('/', protect, validateVehicle, addVehicle);
router.get('/', protect, getMyVehicles);
router.put('/:id', protect, validateVehicle, editVehicle);
router.put('/:id/active', protect, makeVehicleActive);
router.delete('/:id', protect, removeVehicle);

export default router;