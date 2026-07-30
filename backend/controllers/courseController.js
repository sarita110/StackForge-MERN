import pool from "../db/config.js";

// 1. Get all courses along with completion stats for the active user
export const getCourses = async (req, res) => {
  try {
    const user_id = req.user.id; // Extracted by authMiddleware

    // High-performance SQL subqueries to aggregate metrics on the database side
    const queryText = `
      SELECT c.*, 
             (SELECT COUNT(*)::integer FROM lessons WHERE course_id = c.id) AS total_lessons,
             (SELECT COUNT(*)::integer 
              FROM user_progress up 
              INNER JOIN lessons l ON up.lesson_id = l.id 
              WHERE up.user_id = $1 AND l.course_id = c.id) AS completed_lessons
      FROM courses c
      ORDER BY c.created_at DESC;
    `;

    const result = await pool.query(queryText, [user_id]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching courses with metrics:", error);
    res.status(500).json({ message: "Server error fetching courses." });
  }
};

// 2. Get a single course and its lessons list
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const courseResult = await pool.query(
      "SELECT * FROM courses WHERE id = $1",
      [id],
    );
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: "Course not found." });
    }

    const lessonsResult = await pool.query(
      "SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_number ASC",
      [id],
    );

    const courseData = courseResult.rows[0];
    courseData.lessons = lessonsResult.rows;

    res.status(200).json(courseData);
  } catch (error) {
    console.error("Error fetching course details:", error);
    res.status(500).json({ message: "Server error fetching course details." });
  }
};

// 3. Create a new Course (Admin only)
export const createCourse = async (req, res) => {
  try {
    const { title, description, tech_stack } = req.body;
    if (!title || !description || !tech_stack) {
      return res
        .status(400)
        .json({ message: "All course fields are required." });
    }

    const result = await pool.query(
      "INSERT INTO courses (title, description, tech_stack) VALUES ($1, $2, $3) RETURNING *",
      [title, description, tech_stack],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Server error creating course profile." });
  }
};

// 4. Update an existing Course (Admin only)
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tech_stack } = req.body;

    if (!title || !description || !tech_stack) {
      return res
        .status(400)
        .json({ message: "All course fields are required." });
    }

    const result = await pool.query(
      "UPDATE courses SET title = $1, description = $2, tech_stack = $3 WHERE id = $4 RETURNING *",
      [title, description, tech_stack, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server error updating course profile." });
  }
};

// 5. Delete a Course (Admin only)
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM courses WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.status(200).json({
      message: "Course successfully deleted.",
      course: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Server error deleting course." });
  }
};

// 6. Create a Lesson inside a Course (Admin only)
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, order_number } = req.body;

    if (!title || !content || !order_number) {
      return res
        .status(400)
        .json({ message: "All lesson fields are required." });
    }

    const result = await pool.query(
      "INSERT INTO lessons (course_id, title, content, order_number) VALUES ($1, $2, $3, $4) RETURNING *",
      [courseId, title, content, order_number],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({ message: "Server error creating lesson." });
  }
};

// 7. Update an existing Lesson (Admin only)
export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, order_number } = req.body;

    if (!title || !content || !order_number) {
      return res
        .status(400)
        .json({ message: "All lesson fields are required." });
    }

    const result = await pool.query(
      "UPDATE lessons SET title = $1, content = $2, order_number = $3 WHERE id = $4 RETURNING *",
      [title, content, order_number, lessonId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ message: "Server error updating lesson." });
  }
};

// 8. Delete a Lesson (Admin only)
export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const result = await pool.query(
      "DELETE FROM lessons WHERE id = $1 RETURNING *",
      [lessonId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Lesson not found." });
    }

    res.status(200).json({
      message: "Lesson successfully deleted.",
      lesson: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ message: "Server error deleting lesson." });
  }
};
