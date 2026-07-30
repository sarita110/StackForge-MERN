import express from "express";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/courseController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js"; // 👈 Import admin check middleware

const router = express.Router();

router.use(authenticateToken); // Requires authentication for all routes in this file

// Public Student Queries
router.get("/", getCourses);
router.get("/:id", getCourseById);

// Administrative Course Writes
router.post("/", requireAdmin, createCourse);
router.put("/:id", requireAdmin, updateCourse);
router.delete("/:id", requireAdmin, deleteCourse);

// Administrative Lesson Writes
router.post("/:courseId/lessons", requireAdmin, createLesson);
router.put("/:courseId/lessons/:lessonId", requireAdmin, updateLesson);
router.delete("/:courseId/lessons/:lessonId", requireAdmin, deleteLesson);

export default router;
