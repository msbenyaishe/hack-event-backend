require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

async function setup() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("--- Starting Initialization ---");

    // 1. Ensure admins table exists and has the admin user
    const [admins] = await pool.query("SELECT * FROM admins WHERE login = ?", ["admin@hackevent.com"]);
    if (admins.length === 0) {
      console.log("Creating admin user...");
      const hash = await bcrypt.hash("admin123", 10);
      await pool.query("INSERT INTO admins (login, password_hash) VALUES (?, ?)", ["admin@hackevent.com", hash]);
      console.log("Admin user created.");
    } else {
      console.log("Admin user already exists.");
    }

    // 2. Ensure at least one current event exists
    const [currentEvents] = await pool.query("SELECT * FROM events WHERE status = 'current'");
    if (currentEvents.length === 0) {
      console.log("No current event found. Looking for any event to promote or creating one...");
      const [allEvents] = await pool.query("SELECT * FROM events ORDER BY created_at DESC LIMIT 1");
      
      if (allEvents.length > 0) {
        console.log(`Promoting event '${allEvents[0].name}' to current.`);
        await pool.query("UPDATE events SET status = 'current' WHERE id = ?", [allEvents[0].id]);
      } else {
        console.log("Creating a default current event...");
        await pool.query(
          "INSERT INTO events (name, event_date, status, max_leaders, max_team_members) VALUES (?, ?, ?, ?, ?)",
          ["HackEvent 2026", new Date(), "current", 10, 5]
        );
        console.log("Default current event created.");
      }
    } else {
      console.log("Current event already exists.");
    }

    console.log("--- Initialization Finished Successfully ---");
  } catch (err) {
    console.error("Error during initialization:", err);
  } finally {
    await pool.end();
  }
}

setup();
