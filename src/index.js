import { connectDB } from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
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
