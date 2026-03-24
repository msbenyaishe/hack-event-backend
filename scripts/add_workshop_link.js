require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../config/db');

async function migrate() {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to DB, running migration...");
    try {
      await connection.query('ALTER TABLE workshops ADD COLUMN link VARCHAR(500) NULL');
      console.log("Column 'link' successfully added to 'workshops' table.");
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
         console.log("Column 'link' already exists. Skipping.");
      } else {
         throw err;
      }
    }
    connection.release();
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}
migrate();
