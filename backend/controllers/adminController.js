import pool from "../db/config.js";

// Get list of all users
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, is_admin, status, created_at FROM users ORDER BY created_at DESC",
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching users list:", error);
    res
      .status(500)
      .json({ message: "Server error fetching user directories." });
  }
};

// Update user account status (Approve, Block, etc.)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // Expected values: 'pending', 'approved', 'blocked'

    if (!["pending", "approved", "blocked"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status state configuration." });
    }

    const result = await pool.query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING id, username, email, is_admin, status",
      [status, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User account not found." });
    }

    res.status(200).json({
      message: `User account has been set to ${status}.`,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res
      .status(500)
      .json({ message: "Server error updating user profile settings." });
  }
};
