import express from 'express';
import { getPublishedCourses } from '../controllers/courseController.js';

const router = express.Router();

router.get('/published-courses', getPublishedCourses);

export default router;
