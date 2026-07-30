import jwt from "jsonwebtoken";
import pool from "../db/config.js";

export default async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: Session token missing." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret_key_for_development",
    );

    // Live query check to catch blocked or unapproved sessions immediately
    const userResult = await pool.query(
      "SELECT id, username, email, is_admin, status FROM users WHERE id = $1",
      [decoded.id],
    );

    if (userResult.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "Access Denied: User does not exist." });
    }

    const user = userResult.rows[0];

    if (user.status === "blocked") {
      return res
        .status(403)
        .json({
          message:
            "Access Denied: Your account has been blocked by an administrator.",
        });
    }

    if (user.status === "pending") {
      return res
        .status(403)
        .json({
          message:
            "Access Denied: Your account is pending administrator approval.",
        });
    }

    // Attach verified user parameters to the request
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res
      .status(403)
      .json({ message: "Access Denied: Invalid or expired token." });
  }
}
