import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Stub: Stripe Connect account status (full implementation can use Stripe API later)
router.get('/account-status', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      isConnected: false,
      isVerified: false,
      onboardingComplete: false,
      requirements: [],
      accountId: null,
      verificationStage: 'not_started',
      estimatedCompletionTime: null,
    },
  });
});

// Stub: quick status check
router.get('/quick-status', protect, (req, res) => {
  res.json({
    success: true,
    data: { isConnected: false, isVerified: false },
  });
});

export default router;
