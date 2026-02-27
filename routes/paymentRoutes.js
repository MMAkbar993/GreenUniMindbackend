import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getUpcomingPayout,
  getTeacherEarnings,
  getPayoutInfo,
  getTeacherTransactions,
  getPayoutHistory,
  getPayoutPreferences,
  getEarningsGrowth,
  getRevenueChart,
  getFinancialSummary,
  getTopPerformingCourses,
} from '../controllers/paymentController.js';

const router = express.Router();
const teacherAuth = [protect];

router.get('/upcoming-payout/:teacherId', ...teacherAuth, getUpcomingPayout);
router.get('/earnings/:teacherId', ...teacherAuth, getTeacherEarnings);
router.get('/payout-info/:teacherId', ...teacherAuth, getPayoutInfo);
router.get('/transactions/:teacherId', ...teacherAuth, getTeacherTransactions);
router.get('/payouts/:teacherId', ...teacherAuth, getPayoutHistory);
router.get('/payouts/preferences/:teacherId', ...teacherAuth, getPayoutPreferences);
router.get('/earnings-growth/:teacherId', ...teacherAuth, getEarningsGrowth);
router.get('/revenue-chart/:teacherId', ...teacherAuth, getRevenueChart);
router.get('/financial-summary/:teacherId', ...teacherAuth, getFinancialSummary);
router.get('/top-courses/:teacherId', ...teacherAuth, getTopPerformingCourses);

export default router;
