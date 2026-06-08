import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { suggestPrice } from '../controllers/aiController.js';

const router = express.Router();

router.post('/suggest-price', protect, suggestPrice);

export default router;