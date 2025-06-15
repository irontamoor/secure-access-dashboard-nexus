
import express from "express";
import cors from "cors";
import { Pool } from "pg";

// Use environment variables or hardcode for development
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// TODO: Load from your own env
const pool = new Pool({
  user: "postgres",         // CHANGE THIS!
  password: "postgres",     // CHANGE THIS!
  host: "localhost",        // CHANGE THIS!
  port: 5432,
  database: "door_system",  // CHANGE THIS!
});

// Example: GET all users
app.get("/api/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users ORDER BY name;");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.send("API is running");
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
