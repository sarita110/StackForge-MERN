import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Dynamic SSL Checker: If the URL is not local, force secure SSL database handshakes
const isProduction =
  process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("127.0.0.1") &&
  !process.env.DATABASE_URL.includes("localhost");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // FIXED: Automatically apply secure SSL configurations for cloud deployments
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default pool;
