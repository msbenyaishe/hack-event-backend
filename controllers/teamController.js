const pool = require("../config/db");


// CREATE TEAM
exports.createTeam = async (req, res) => {

  try {

    const leaderId = req.session.memberId;

    //check if leader already has a team
    const [member] = await pool.query(
    "SELECT team_id FROM members WHERE id=?",
    [leaderId]
    );

    if (member[0].team_id !== null) {
    return res.status(400).json({
        error: "Leader already has a team"
    });



    }

    const [event_id] = await pool.query(
      "SELECT event_id FROM members WHERE id=?",
      [leaderId]
    );
    const {
      name,
      color
    } = req.body;

    const logo = req.file ? req.file.path : null;

    // create team
    const [result] = await pool.query(
      `INSERT INTO teams
      (name, logo, color, event_id, leader_id)
      VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        logo,
        color,
        event_id[0].event_id,
        leaderId
      ]
    );

    const teamId = result.insertId;

    // update leader team_id
    await pool.query(
      "UPDATE members SET team_id=? WHERE id=?",
      [teamId, leaderId]
    );

    res.json({
      message: "Team created",
      team_id: teamId
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// GET ALL TEAMS
exports.getTeams = async (req, res) => {

  try {

    const [rows] = await pool.query("SELECT * FROM teams");

    res.json(rows);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// GET SINGLE TEAM
exports.getTeam = async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM teams WHERE id=?",
      [id]
    );

    res.json(rows[0]);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// UPDATE TEAM
exports.updateTeam = async (req, res) => {

  try {

    const { id } = req.params;

    const { name, color } = req.body;

    const logo = req.file ? req.file.path : null;

    if (logo) {

      await pool.query(
        `UPDATE teams
         SET name=?, logo=?, color=?
         WHERE id=?`,
        [name, logo, color, id]
      );

    } else {

      await pool.query(
        `UPDATE teams
         SET name=?, color=?
         WHERE id=?`,
        [name, color, id]
      );

    }

    res.json({ message: "Team updated" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// DELETE TEAM
exports.deleteTeam = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM teams WHERE id=?",
      [id]
    );

    res.json({ message: "Team deleted" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// REMOVE TEAM MEMBER
exports.removeTeamMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    // First check if the member exists and belongs to this team
    const [memberRows] = await pool.query(
      "SELECT team_id, role FROM members WHERE id=? AND team_id=?",
      [memberId, id]
    );

    if (memberRows.length === 0) {
      return res.status(404).json({ error: "Member not found in this team" });
    }
    
    // We cannot completely delete a leader through the team removal interface
    if (memberRows[0].role === 'leader') {
        return res.status(400).json({ error: "Cannot delete team leader this way" });
    }

    await pool.query(
      "DELETE FROM members WHERE id=?",
      [memberId]
    );

    res.json({ message: "Team member removed. User deleted." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE SCORES (ADMIN)
exports.updateScores = async (req, res) => {
  try {
    const { id } = req.params;
    const { practical_score, theoretical_score } = req.body;

    if (practical_score !== undefined && (practical_score < 0 || practical_score > 20)) {
        return res.status(400).json({ error: "Practical score must be between 0 and 20" });
    }

    if (theoretical_score !== undefined && (theoretical_score < 0 || theoretical_score > 20)) {
        return res.status(400).json({ error: "Theoretical score must be between 0 and 20" });
    }

    // Build query based on provided scores
    const fieldsToUpdate = [];
    const values = [];

    if (practical_score !== undefined) {
        fieldsToUpdate.push("practical_score=?");
        values.push(practical_score);
    }
    
    if (theoretical_score !== undefined) {
        fieldsToUpdate.push("theoretical_score=?");
        values.push(theoretical_score);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: "No scores provided to update" });
    }

    values.push(id);

    const query = `UPDATE teams SET ${fieldsToUpdate.join(", ")} WHERE id=?`;

    await pool.query(query, values);

    res.json({ message: "Team scores updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET TEAM MEMBERS
exports.getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, email, role, portfolio FROM members WHERE team_id=?",
      [id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SCOREBOARD
exports.getScoreboard = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await pool.query(
      `SELECT t.id, t.name, t.logo, t.color, t.practical_score, t.theoretical_score, 
              (t.practical_score + t.theoretical_score) as total_score
       FROM teams t
       WHERE t.event_id=?
       ORDER BY total_score DESC, t.name ASC`,
      [eventId]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};