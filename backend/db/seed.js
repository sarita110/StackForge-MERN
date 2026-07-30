import pool from "./config.js";
import bcrypt from "bcryptjs";

const seedDatabase = async () => {
  try {
    console.log("⏳ Starting database upgrade and seeding...");

    // 1. DROP TABLES
    await pool.query(`
      DROP TABLE IF EXISTS user_progress CASCADE;
      DROP TABLE IF EXISTS lessons CASCADE;
      DROP TABLE IF EXISTS courses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("🗑️ Old tables dropped.");

    // 2. CREATE TABLES (With RBAC & Approval Controls)
    await pool.query(`
      -- Upgraded Users Table
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,                     -- 👈 Admin privileges flag
        status VARCHAR(20) DEFAULT 'pending',                -- 👈 Account status: pending, approved, blocked
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        tech_stack VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        order_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE user_progress (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, lesson_id)
      );
    `);
    console.log("🏗️ Upgraded schemas created successfully.");

    // 3. SEED USERS (Generating safe hashes)
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash("admin123", salt);
    const studentHash = await bcrypt.hash("student123", salt);

    // Seed Admin (Approved)
    await pool.query(
      `
      INSERT INTO users (username, email, password_hash, is_admin, status)
      VALUES ('admin_root', 'admin@stackforge.com', $1, true, 'approved')
    `,
      [adminHash],
    );

    // Seed Approved Student
    await pool.query(
      `
      INSERT INTO users (username, email, password_hash, is_admin, status)
      VALUES ('student_john', 'john@stackforge.com', $1, false, 'approved')
    `,
      [studentHash],
    );

    // Seed Pending Student
    await pool.query(
      `
      INSERT INTO users (username, email, password_hash, is_admin, status)
      VALUES ('student_pending', 'pending@stackforge.com', $1, false, 'pending')
    `,
      [studentHash],
    );

    console.log("👤 Root accounts seeded.");

    // 4. SEED COURSES & LESSONS
    const courseResult = await pool.query(`
      INSERT INTO courses (title, description, tech_stack) 
      VALUES ('The Ultimate MERN (with Postgres) Guide', 'Learn to build an industry-level Meta app from scratch.', 'React, Node, Postgres')
      RETURNING id;
    `);

    const courseId = courseResult.rows[0].id;

    await pool.query(
      `
      INSERT INTO lessons (course_id, title, content, order_number) VALUES 
      ($1, '1. Introduction to Relational Databases', 'PostgreSQL is a powerful, open-source object-relational database system...', 1),
      ($1, '2. Setting up Node & Express', 'Express is a minimal and flexible Node.js web application framework...', 2),
      ($1, '3. Building RESTful APIs', 'REST stands for REpresentational State Transfer. It is an architectural style...', 3);
    `,
      [courseId],
    );

    console.log("🌱 Dynamic syllabus components seeded.");
  } catch (err) {
    console.error("❌ Error upgrading database:", err);
  } finally {
    await pool.end();
    console.log("🚪 Connection closed.");
  }
};

seedDatabase();
