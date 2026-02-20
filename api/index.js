/**
 * Vercel serverless entry. Connects DB on first request, then forwards to Express.
 * Never calls process.exit so CORS and error responses can always be sent.
 */
import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

let dbPromise = null;

function ensureDb() {
  if (dbPromise) return dbPromise;
  dbPromise = connectDB().catch((err) => {
    console.error("MongoDB connection error:", err.message);
    dbPromise = null;
    throw err;
  });
  return dbPromise;
}

export default async function handler(req, res) {
  try {
    await ensureDb();
  } catch (_) {
    res.status(503).json({ success: false, message: "Database unavailable" });
    return;
  }
  app(req, res);
}
