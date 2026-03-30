const pool = require("../config/db");

// Submit or update a workshop submission
exports.submitWorkshop = async (req, res) => {
  try {
    const { workshop_id, repo_link, web_app_link, pdf_link } = req.body;
    const user = req.user; // from auth middleware

    if (!user || user.role !== 'leader') {
      return res.status(403).json({ error: "Only team leaders can submit work." });
    }

    // Get the team_id for this leader
    const [teamRows] = await pool.query("SELECT id FROM teams WHERE leader_id = ?", [user.id]);
    
    if (teamRows.length === 0) {
      return res.status(404).json({ error: "You are not assigned as a leader to any team." });
    }
    
    const team_id = teamRows[0].id;

    // Check if submission already exists
    const [existing] = await pool.query(
      "SELECT id FROM submissions WHERE team_id = ? AND workshop_id = ?",
      [team_id, workshop_id]
    );

    if (existing.length > 0) {
      // Update
      await pool.query(
        "UPDATE submissions SET repo_link = ?, web_app_link = ?, pdf_link = ? WHERE team_id = ? AND workshop_id = ?",
        [repo_link || null, web_app_link || null, pdf_link || null, team_id, workshop_id]
      );
      return res.json({ message: "Submission updated successfully" });
    } else {
      // Insert
      await pool.query(
        "INSERT INTO submissions (team_id, workshop_id, repo_link, web_app_link, pdf_link) VALUES (?, ?, ?, ?, ?)",
        [team_id, workshop_id, repo_link || null, web_app_link || null, pdf_link || null]
      );
      return res.json({ message: "Submission created successfully" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get submissions for the caller's team
exports.getLeaderSubmissions = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'leader') {
      return res.status(403).json({ error: "Only team leaders can view their submissions." });
    }

    const [teamRows] = await pool.query("SELECT id FROM teams WHERE leader_id = ?", [user.id]);
    
    if (teamRows.length === 0) {
      return res.json([]);
    }
    
    const team_id = teamRows[0].id;

    const [submissions] = await pool.query(
      "SELECT s.*, w.title as workshop_title FROM submissions s JOIN workshops w ON s.workshop_id = w.id WHERE s.team_id = ?",
      [team_id]
    );

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all submissions across all teams (for Admins)
exports.getAllSubmissions = async (req, res) => {
  try {
    const [submissions] = await pool.query(`
      SELECT s.*, 
             t.name as team_name, 
             w.title as workshop_title,
             w.event_id
      FROM submissions s 
      JOIN teams t ON s.team_id = t.id 
      JOIN workshops w ON s.workshop_id = w.id
      ORDER BY s.created_at DESC
    `);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
