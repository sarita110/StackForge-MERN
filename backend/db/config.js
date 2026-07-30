import pg from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const { Pool } = pg;

// Create the connection pool ONCE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export it so other files can use it
export default pool;
