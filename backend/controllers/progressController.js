import pool from "../db/config.js";

// 1. Toggle lesson completion status
export const toggleLessonProgress = async (req, res) => {
  try {
    const { lesson_id } = req.body;
    const user_id = req.user.id; // Provided by authMiddleware

    if (!lesson_id) {
      return res.status(400).json({ message: "Lesson ID is required." });
    }

    // Check if the progress record already exists
    const checkResult = await pool.query(
      "SELECT * FROM user_progress WHERE user_id = $1 AND lesson_id = $2",
      [user_id, lesson_id],
    );

    if (checkResult.rows.length > 0) {
      // Record exists -> Remove it (Mark as incomplete)
      await pool.query(
        "DELETE FROM user_progress WHERE user_id = $1 AND lesson_id = $2",
        [user_id, lesson_id],
      );
      return res
        .status(200)
        .json({ completed: false, message: "Lesson marked as incomplete." });
    } else {
      // Record does not exist -> Create it (Mark as complete)
      await pool.query(
        "INSERT INTO user_progress (user_id, lesson_id) VALUES ($1, $2)",
        [user_id, lesson_id],
      );
      return res
        .status(200)
        .json({ completed: true, message: "Lesson marked as completed." });
    }
  } catch (error) {
    console.error("Error toggling progress:", error);
    res.status(500).json({ message: "Server error toggling progress status." });
  }
};

// 2. Fetch list of completed lesson IDs for a specific user and course
export const getCompletedLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user.id; // Provided by authMiddleware

    // Query combines user_progress and lessons using INNER JOIN
    const result = await pool.query(
      `SELECT up.lesson_id 
       FROM user_progress up
       INNER JOIN lessons l ON up.lesson_id = l.id
       WHERE up.user_id = $1 AND l.course_id = $2`,
      [user_id, courseId],
    );

    // Map rows into a flat array of IDs: [1, 3] for easier frontend rendering
    const completedIds = result.rows.map((row) => row.lesson_id);

    res.status(200).json(completedIds);
  } catch (error) {
    console.error("Error fetching completed lessons:", error);
    res
      .status(500)
      .json({ message: "Server error fetching completion details." });
  }
};
