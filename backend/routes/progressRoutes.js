import express from "express";
import {
  toggleLessonProgress,
  getCompletedLessons,
} from "../controllers/progressController.js";
import authenticateToken from "../middleware/authMiddleware.js"; // 👈 Import security guard

const router = express.Router();

// Apply the authorization middleware to all routes inside this module
router.use(authenticateToken);

// Route: POST http://localhost:5000/api/progress/toggle
router.post("/toggle", toggleLessonProgress);

// Route: GET http://localhost:5000/api/progress/course/:courseId
router.get("/course/:courseId", getCompletedLessons);

export default router;
