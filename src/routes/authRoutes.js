import express from 'express';
import { signup, login, getMe, logout, verifyOtp, resendVerification, getRateLimitStatus } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-otp', verifyOtp);
router.post('/resend-verification', resendVerification);
router.get('/rate-limit-status', getRateLimitStatus);
router.get('/me', protect, getMe);

export default router;
