import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Models (kept if you need them initialized)
import { User, Teacher, Course, Progress } from "./models/index.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- MIDDLEWARE -------------------- */

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
  ✅ FIXED CORS CONFIGURATION
  - Exact origin match (NO trailing slash)
  - Supports cookies / auth headers
  - Handles preflight requests required by RTK Query
*/
app.use(
  cors({
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight
app.options("*", cors());

/* -------------------- ROUTES -------------------- */

// Auth routes
app.use("/api/auth", authRoutes); // optional versioned path
app.use("/auth", authRoutes);     // direct path (used by your frontend)

// User routes
app.use("/users", userRoutes);

// Category routes
app.use("/categories", categoryRoutes);

// Course routes (public)
app.use("/courses", courseRoutes);

/* -------------------- HEALTH CHECK -------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "GreenUniMind API Running",
  });
});

/* -------------------- DATABASE + SERVER START -------------------- */

connectDB()
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Available endpoints:");
      console.log("POST  /auth/login");
      console.log("POST  /users/create-student");
      console.log("POST  /users/create-teacher");
      console.log("GET   /users/me");
      console.log("GET   /categories/with-subcategories");
      console.log("GET   /courses/published-courses");
      console.log("GET   /api/health");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

export { connectDB, User, Teacher, Course, Progress };
