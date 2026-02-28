import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import { seedAchievements } from './controllers/achievementController.js';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import stripeConnectRoutes from './routes/stripeConnectRoutes.js';
import messagingRoutes from './routes/messagingRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import lectureRoutes from './routes/lectureRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import impactRoutes from './routes/impactRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

seedAchievements().catch((err) => console.warn('Achievement seed:', err?.message || err));

const app = express();

// Normalize origin (no trailing slash) so CORS header always matches browser comparison
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  // Production frontend (Vercel)
  'https://green-uni-mindforntend.vercel.app',
  'https://green-uni-mindfrontend.vercel.app', // in case typo is fixed
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/+$/, '')) : []),
].filter(Boolean);

const normalizeOrigin = (origin) => (origin || '').replace(/\/+$/, '');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow no-origin (e.g. same-origin, Postman)
    const normalized = normalizeOrigin(origin);
    const allowed = allowedOrigins.includes(normalized);
    // Return normalized origin so header never has trailing slash (avoids CORS mismatch)
    callback(allowed ? null : null, allowed ? normalized : false);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stripe-connect', stripeConnectRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'GreenUniMind API is running.' });
});
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'GreenUniMind API is running.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
