import express from "express";
import {
  getAllUsers,
  updateUserStatus,
} from "../controllers/adminController.js";
import authenticateToken from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js"; // 👈 Import admin verification middleware

const router = express.Router();

// Secure all admin routes behind both the authentication token check and admin verification
router.use(authenticateToken);
router.use(requireAdmin);

// Route: GET http://localhost:5000/api/admin/users
router.get("/users", getAllUsers);

// Route: PUT http://localhost:5000/api/admin/users/:userId/status
router.put("/users/:userId/status", updateUserStatus);

export default router;
