const pool = require("./config/db");

async function fixTable() {
    try {
        console.log("Altering teams table to allow NULL leader_id...");
        await pool.query("ALTER TABLE teams MODIFY leader_id INT NULL");
        console.log("Success! leader_id is now nullable in teams table.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

fixTable();
