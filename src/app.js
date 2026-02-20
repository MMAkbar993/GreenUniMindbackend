import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
  CORS first so every response (including errors) gets CORS headers.
  No trailing slashes. Production frontend URL included by default.
*/
function normalizeOrigin(url) {
  return (url || "").trim().replace(/\/$/, "");
}
const corsOriginsFromEnv = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(normalizeOrigin).filter(Boolean)
  : [];
const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL || "http://localhost:8080");
const corsOrigins = [...new Set([
  ...corsOriginsFromEnv,
  frontendUrl,
  "https://green-uni-mindforntend.vercel.app",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
].filter(Boolean))];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowed = corsOrigins.includes(normalizeOrigin(origin));
      cb(null, allowed ? origin : false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

/* -------------------- ROUTES -------------------- */

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/courses", courseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "GreenUniMind API Running" });
});

export default app;
