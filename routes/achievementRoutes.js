import express from 'express';
import { getAllAchievements, getMyAchievements } from '../controllers/achievementController.js';
import { protect } from '../middleware/auth.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const router = express.Router();

router.get('/', getAllAchievements);
router.get('/my', protect, getMyAchievements);

export default router;
