import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { 
    getUsers, 
    updateUserRole, 
    getPaymentsAndRefunds, 
    getSystemStats, 
    resolveSOS 
} from '../controllers/adminController.js';

const router = express.Router();

// Apply auth + admin protections to all administrative routes
router.use(protect);
router.use(adminOnly);

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/payments', getPaymentsAndRefunds);
router.get('/stats', getSystemStats);
router.put('/sos/:id/resolve', resolveSOS);

export default router;
