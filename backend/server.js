import app from "./app.js";
import pool from "./db/config.js";

// Connect to PostgreSQL database
pool
  .connect()
  .then(() => console.log("✅ Successfully connected to PostgreSQL Database!"))
  .catch((err) => console.error("❌ Database connection error:", err.stack));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
