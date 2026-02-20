import express from 'express';
import multer from 'multer';
import { createStudent, createTeacher, getMeUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer().none();

router.post('/create-student', upload, createStudent);
router.post('/create-teacher', upload, createTeacher);
router.get('/me', protect, getMeUser);

export default router;
