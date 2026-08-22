import pool from "./config.js";
import bcrypt from "bcryptjs";

// --- META LESSON 1: SQL SYNTAX ---
const lesson1Content = `### Module 1: Foundational Docker & Database Isolation

#### 1. System Engineering Theory
Running database systems natively on your operating system introduces configuration drift across team environments. Docker virtualizes an isolated PostgreSQL instance inside a lightweight container, running consistently regardless of your host OS.

#### 2. Configuration Blueprint
We define our container using a \`docker-compose.yml\` configuration:
\`\`\`yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: stackforge
    ports:
      - "5434:5432"
\`\`\`

---

### 3. PostgreSQL Database Syntax Breakdown (For Beginners)

Let's dissect the SQL commands we used to build our database:

#### A. \`CREATE TABLE users\`
This tells PostgreSQL to reserve a new tabular spreadsheet named \`users\` inside our database.

#### B. \`id SERIAL PRIMARY KEY\`
*   **\`SERIAL\`**: A special Postgres data type. It automatically starts at \`1\` and increments by \`1\` for every new user registered. You do not need to manually calculate IDs.
*   **\`PRIMARY KEY\`**: Tells the database that this column is the absolute unique identifier for each user. No two users can ever share the same ID.

#### C. \`username VARCHAR(50) UNIQUE NOT NULL\`
*   **\`VARCHAR(50)\`**: Represents a Variable Character string up to a maximum length of 50 characters.
*   **\`UNIQUE\`**: Tells the database to block registrations if an email or username already exists in the table.
*   **\`NOT NULL\`**: Enforces database-level validation; the database will reject the entry if this field is empty.

#### D. \`course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE\`
*   **\`REFERENCES courses(id)\`**: Enforces a **Foreign Key constraint**. It declares that the number in this column *must* match an actual existing ID in our \`courses\` table, ensuring data consistency.
*   **\`ON DELETE CASCADE\`**: If an administrator deletes a Course, PostgreSQL automatically deletes all Lessons associated with that course, preventing orphan records.

#### E. \`PRIMARY KEY (user_id, lesson_id)\`
*   Instead of an auto-incrementing ID, we combined two columns to form a **Composite Primary Key**. This database-level constraint ensures that a user (\`user_id\`) can never mark the exact same lesson (\`lesson_id\`) as completed twice.`;

// --- META LESSON 2: EXPRESS SYNTAX ---
const lesson2Content = `### Module 2: Express MVC Architecture & Performance SQL Queries

#### 1. System Engineering Theory
To scale applications cleanly, we implement the **Model-View-Controller (MVC)** design pattern. Decoupling routing, controllers, and models prevents project codebases from becoming unmanageable.

#### 2. Performance-Driven Database Queries
When fetching courses on the dashboard, making separate database calls to count completed lessons inside a JavaScript loop degrades server performance (the N+1 Query Problem). We resolved this by querying PostgreSQL using subqueries, resolving all metrics inside a single database transaction.

---

### 3. Express & Node.js Syntax Breakdown (For Beginners)

Let's dissect the Express controller syntax we wrote:

#### A. \`export const getCourses = async (req, res) => { ... }\`
*   **\`export\`**: Allows us to import this function into our router files.
*   **\`async\`**: Declares that this function performs asynchronous operations (querying our database). It allows the server to handle other requests while waiting for the database to respond.
*   **\`req\` (Request)**: Holds data sent *to* the server from the client (e.g., headers, body inputs, URL params).
*   **\`res\` (Response)**: Contains the methods our server uses to send data *back* to the client.

#### B. \`const { id } = req.params;\`
This is called **ES6 Object Destructuring**. URL parameters represent variables inside our route path (e.g., \`/api/courses/:id\`). If a user visits \`/api/courses/4\`, \`req.params\` contains \`{ id: "4" }\`. Destructuring extracts that value directly into a variable named \`id\`.

#### C. \`app.use(express.json());\`
Express does not read incoming JSON request bodies by default. This middleware statement intercepts incoming payloads and parses them into a readable JavaScript object under \`req.body\`.

#### D. \`await pool.query(queryText, [id]);\`
*   **\`await\`**: Pauses function execution until our PostgreSQL query finishes, returning our dataset.
*   **\`[id]\`**: An array of parameters. Instead of concatenating variables directly into our SQL string, we use parameterized markers (\`$1\`) to prevent SQL Injection security vulnerabilities.`;

// --- META LESSON 3: REACT SYNTAX ---
const lesson3Content = `### Module 3: React Hooks, Router, and Context Subscription

#### 1. System Engineering Theory
Because HTTP is stateless, the server does not remember user identities. We implement JSON Web Tokens (JWT). Once logged in, the client stores this token and passes it inside the \`Authorization\` headers of subsequent requests to prove their identity safely.

---

### 2. React Hook & JSX Syntax Breakdown (For Beginners)

Let's dissect the core React architectures we used to build our frontend:

#### A. \`const [courses, setCourses] = useState([]);\`
*   **\`useState\`**: React does not automatically track standard JavaScript variable changes. We use state hooks to store variable values.
*   **\`courses\`**: The read-only state variable containing our values.
*   **\`setCourses\`**: The updater function. Every time we call \`setCourses(new_data)\`, React automatically re-renders the UI to display the new information.

#### B. \`useEffect(() => { ... }, [token]);\`
*   The **\`useEffect\`** hook handles "side effects"—actions that run outside of rendering, such as fetching data from an API.
*   **Dependency Array (\`[token]\`)**: Tells React when to run this effect. By passing \`[token]\`, the hook executes once when the page loads, and then re-runs only if the session token changes.

#### C. \`const { user } = useAuth();\`
Instead of passing the active user profile down through multiple nested component properties (called "Prop Drilling"), we created a global **Context Provider**. This hook allows any component in our application to subscribe to and read session details instantly.

#### D. \`className="flex h-screen bg-brand-bg"\`
In standard HTML, we write \`class\` for CSS styles. In React, we write inside a JavaScript variant (JSX). Because \`class\` is already a reserved keyword in JavaScript, we write **\`className\`** instead.

#### E. \`axios.get(url, { headers: { Authorization: \`Bearer \${token}\` } })\`
We configure our Axios requests to pass our security token inside the authorization headers. This string acts as our digital key, proving our logged-in identity on protected endpoints.`;

// --- DATABASE SEED WRITER EXECUTION ---
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

    // 2. CREATE TABLES
    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'pending',
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
    console.log("🏗️ Relational database schemas compiled.");

    // 3. SEED SYSTEM ACCOUNTS
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

    console.log("👤 System accounts seeded successfully.");

    // 4. SEED THE UPGRADED COURSE
    const courseResult = await pool.query(`
      INSERT INTO courses (title, description, tech_stack) 
      VALUES ('StackForge Architecture Guide', 'Learn to build this exact full-stack application from scratch, exploring Docker databases, Express MVC engines, and secure React Context authentication.', 'Docker, PostgreSQL, Node, React')
      RETURNING id;
    `);

    const courseId = courseResult.rows[0].id;

    // Write lessons
    await pool.query(
      `
      INSERT INTO lessons (course_id, title, content, order_number) VALUES 
      ($1, '1. Foundational Docker & Database Isolation', $2, 1),
      ($1, '2. Express MVC Engine & Stateful Relational Queries', $3, 2),
      ($1, '3. React Authentication & Protected Client Handlers', $4, 3);
    `,
      [courseId, lesson1Content, lesson2Content, lesson3Content],
    );

    console.log("🌱 Meta-Learning syllabus populated successfully.");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await pool.end();
    console.log("🚪 Seeding completed. Connection pool released.");
  }
};

seedDatabase();
