import express from 'express';
import { sendOTP, register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/register', register);
router.post('/login', login);

export default router;