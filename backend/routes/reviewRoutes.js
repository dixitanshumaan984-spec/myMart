import express from 'express';
import { addReview, getProductReviews } from '../controllers/reviewController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, addReview);
router.get('/:productId', getProductReviews);

export default router;