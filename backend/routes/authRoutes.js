import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Route: POST http://localhost:5000/api/auth/register
router.post("/register", register);

// Route: POST http://localhost:5000/api/auth/login
router.post("/login", login);

export default router;
