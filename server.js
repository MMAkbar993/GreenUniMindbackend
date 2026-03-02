import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import connectDB from './config/database.js';
import { seedAchievements } from './controllers/achievementController.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Validate required env vars at startup (Vercel/serverless won't load .env - set in dashboard)
const requiredEnv = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
const missing = requiredEnv.filter((k) => !process.env[k]?.trim());
if (missing.length) {
  console.error('Missing required env vars:', missing.join(', '));
  console.error('Set them in Vercel: Project → Settings → Environment Variables');
  process.exit(1);
}
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
import aiRoutes from './routes/aiRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import subCategoryRoutes from './routes/subCategoryRoutes.js';

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

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = normalizeOrigin(origin);
    const allowed = allowedOrigins.includes(normalized);
    callback(allowed ? null : null, allowed ? normalized : false);
  },
  credentials: true,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(mongoSanitize());
app.use(hpp());

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
app.use('/api/ai', aiRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/sub-category', subCategoryRoutes);

app.post('/api/errors', (req, res) => {
  console.error('Client error report:', req.body);
  res.json({ success: true });
});

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
