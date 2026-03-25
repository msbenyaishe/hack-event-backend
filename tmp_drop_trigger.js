const pool = require("./config/db");

async function dropTrigger() {
  try {
    console.log("Dropping trigger before_team_delete...");
    await pool.query("DROP TRIGGER IF EXISTS before_team_delete");
    console.log("Trigger dropped successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error dropping trigger:", err);
    process.exit(1);
  }
}

dropTrigger();
