import express from 'express';
import { getImageKitAuth } from '../controllers/uploadController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import roleMiddleware from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/auth', authMiddleware, roleMiddleware('admin'), getImageKitAuth);

export default router;