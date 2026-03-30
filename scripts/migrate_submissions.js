const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });

    console.log("Connected to the database. Creating `submissions` table...");

    const query = `
      CREATE TABLE IF NOT EXISTS \`submissions\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`team_id\` int(11) NOT NULL,
        \`workshop_id\` int(11) NOT NULL,
        \`repo_link\` varchar(255) DEFAULT NULL,
        \`web_app_link\` varchar(255) DEFAULT NULL,
        \`pdf_link\` varchar(255) DEFAULT NULL,
        \`created_at\` timestamp NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`team_workshop\` (\`team_id\`,\`workshop_id\`),
        CONSTRAINT \`submissions_ibfk_1\` FOREIGN KEY (\`team_id\`) REFERENCES \`teams\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`submissions_ibfk_2\` FOREIGN KEY (\`workshop_id\`) REFERENCES \`workshops\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    await connection.query(query);
    console.log("Migration successful. Table `submissions` created or already exists.");

    await connection.end();
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
