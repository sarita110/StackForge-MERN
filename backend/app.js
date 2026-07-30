import express from "express";
import cors from "cors";
import courseRoutes from "./routes/courseRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Route Mounts
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the StackForge API!");
});

export default app; // 👈 Exporting app without starting the port listener
