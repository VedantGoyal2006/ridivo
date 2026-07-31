import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    suggestPrice, 
    getRecommendations, 
    checkReviewContent, 
    getDemandAnalytics 
} from '../controllers/aiController.js';

const router = express.Router();

// Apply auth protections
router.use(protect);

router.post('/suggest-price', suggestPrice);
router.get('/recommendations', getRecommendations);
router.post('/check-review', checkReviewContent);
router.get('/demand-analytics', getDemandAnalytics);

export default router;