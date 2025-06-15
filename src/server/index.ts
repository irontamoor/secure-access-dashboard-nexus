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

// --- Door Permissions API ---

// Get all doors
app.get("/api/doors", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM doors ORDER BY name;");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching doors", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users ORDER BY name;");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching users", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all door permissions
app.get("/api/door_permissions", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM door_permissions ORDER BY granted_at DESC;"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching door permissions", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a door permission by id
app.delete("/api/door_permissions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM door_permissions WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting door permission", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all door groups
app.get("/api/door_groups", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM door_groups ORDER BY name;");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching door groups", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Controller API Keys endpoints ---
app.get("/api/keys", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM controller_api_keys ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching API keys", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/keys", async (req, res) => {
  try {
    const { controller_name } = req.body;
    if (!controller_name) return res.status(400).json({ error: "Controller name required" });
    // Generate random API key
    const api_key = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 36).toString(36)
    ).join("");
    const { rows } = await pool.query(
      "INSERT INTO controller_api_keys (controller_name, api_key, is_active) VALUES ($1, $2, true) RETURNING *",
      [controller_name, api_key]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error generating API key", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/keys/:id/revoke", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE controller_api_keys SET is_active = false WHERE id = $1",
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error revoking key", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.send("API is running");
});

// --- System Settings API ---
// Get all settings or only those with a key prefix (e.g. ?prefix=ldap_)
app.get("/api/system_settings", async (req, res) => {
  try {
    const { prefix } = req.query;
    let rows;
    if (prefix) {
      const q = "SELECT * FROM system_settings WHERE setting_key LIKE $1";
      const filter = String(prefix) + "%";
      ({ rows } = await pool.query(q, [filter]));
    } else {
      ({ rows } = await pool.query("SELECT * FROM system_settings"));
    }
    res.json(rows);
  } catch (err) {
    console.error("Error fetching system settings", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Upsert a system setting
app.post("/api/system_settings", async (req, res) => {
  try {
    const { setting_key, setting_value, setting_type } = req.body;
    if (!setting_key) return res.status(400).json({ error: "setting_key required" });
    const q = `
      INSERT INTO system_settings (setting_key, setting_value, setting_type, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (setting_key) DO UPDATE 
        SET setting_value = $2, setting_type = $3, updated_at = NOW()
      RETURNING *;
    `;
    const values = [setting_key, setting_value, setting_type ?? "string"];
    const { rows } = await pool.query(q, values);
    res.json(rows[0]);
  } catch (err) {
    console.error("Error upserting system setting", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get LDAP sync logs (latest 10)
app.get("/api/ldap_sync_logs", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM ldap_sync_log ORDER BY sync_started_at DESC LIMIT 10"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching LDAP sync logs", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
