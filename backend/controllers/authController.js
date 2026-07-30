import pool from "../db/config.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1. User Registration (Signed accounts are set to 'pending' status by default)
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username],
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Username or Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // New registrations default to FALSE for is_admin, and 'pending' for status
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash, is_admin, status) VALUES ($1, $2, $3, false, 'pending') RETURNING id, username, email, is_admin, status, created_at",
      [username, email, passwordHash],
    );

    const user = newUser.rows[0];

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "fallback_secret_key_for_development",
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message:
        "User registered successfully. Your account is pending administrator approval.",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// 2. User Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Block logic checks are handled during login too for quick feedback
    if (user.status === "blocked") {
      return res
        .status(403)
        .json({
          message: "Your account has been blocked by an administrator.",
        });
    }

    if (user.status === "pending") {
      return res
        .status(403)
        .json({ message: "Your account is pending administrator approval." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "fallback_secret_key_for_development",
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin, // 👈 Required by React client routing
        status: user.status,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};
