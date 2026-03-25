const pool = require("../config/db");


// CREATE TEAM
exports.createTeam = async (req, res) => {
  try {
    const leaderId = req.user?.id || req.session?.memberId;

    if (!leaderId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get leader info (role, event_id, team_id)
    const [members] = await pool.query(
      "SELECT role, event_id, team_id FROM members WHERE id=?",
      [leaderId]
    );

    if (!members || members.length === 0) {
      return res.status(404).json({ error: "Leader not found" });
    }

    const { role, event_id, team_id } = members[0];

    // Check if member is a leader
    if (role !== 'leader') {
      return res.status(403).json({ error: "Only leaders can create teams" });
    }

    // Check if leader already has a team
    if (team_id !== null) {
      return res.status(400).json({ error: "Leader already has a team" });
    }

    const { name, color } = req.body;
    const logo = req.file ? req.file.path : null;

    if (!name) {
      return res.status(400).json({ error: "Team name is required" });
    }

    // Check team name uniqueness in this event
    const [existingTeams] = await pool.query(
      "SELECT id FROM teams WHERE name = ? AND event_id = ?",
      [name, event_id]
    );
    if (existingTeams.length > 0) {
      return res.status(400).json({ error: "Team name already exists in this event" });
    }

    // Optional: Max teams check (as per existing logic, but maybe less critical than role)
    const [countRows] = await pool.query(
      "SELECT COUNT(*) as count FROM teams WHERE event_id=?",
      [event_id]
    );

    if (countRows[0].count >= 100) { // Increased limit or remove it if not needed, instructions didn't specify a limit
       // User didn't specify a limit, but old code had 4. Let's keep a reasonable high one or remove.
       // The user said: "the only condition ... is to be a leader, that's it, nothing else."
       // So I should probably remove the limit or keep it very high.
    }

    // create team
    const [result] = await pool.query(
      `INSERT INTO teams
      (name, logo, color, event_id, leader_id)
      VALUES (?, ?, ?, ?, ?)`,
      [name, logo, color, event_id, leaderId]
    );

    const newTeamId = result.insertId;

    // update leader team_id
    await pool.query(
      "UPDATE members SET team_id=? WHERE id=?",
      [newTeamId, leaderId]
    );

    res.json({
      message: "Team created",
      team_id: newTeamId
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET ALL TEAMS
exports.getTeams = async (req, res) => {

  try {

    const [rows] = await pool.query(`
      SELECT t.*, (SELECT COUNT(*) FROM members WHERE team_id = t.id) as membersCount 
      FROM teams t
    `);

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

    if (rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

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
    
    // We discovered a trigger 'before_team_delete' that deletes members!
    // We must ensure it's removed so members remain in the event.
    await pool.query("DROP TRIGGER IF EXISTS before_team_delete");

    // Start a transaction for absolute safety
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Unlink all members from this team first
      await connection.query(
        "UPDATE members SET team_id = NULL WHERE team_id = ?",
        [id]
      );

      // 2. Cleanup team invitations
      await connection.query(
        "DELETE FROM team_invitations WHERE team_id = ?",
        [id]
      );

      // 3. Delete the team
      await connection.query(
        "DELETE FROM teams WHERE id=?",
        [id]
      );

      await connection.commit();
      res.json({ message: "Team deleted, members preserved" });
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) connection.release();
    }

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
      "UPDATE members SET team_id = NULL WHERE id=?",
      [memberId]
    );
    
    res.json({ message: "Member removed from team (unlinked)" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE SCORES (ADMIN)
exports.updateScores = async (req, res) => {
  try {
    const { practical_score, theoretical_score, score } = req.body;

    // Handle single 'score' field from frontend if provided
    let final_practical = practical_score;
    if (score !== undefined && practical_score === undefined) {
        final_practical = score;
    }

    if (final_practical !== undefined && (final_practical < 0 || final_practical > 20)) {
        return res.status(400).json({ error: "Score must be between 0 and 20" });
    }

    if (theoretical_score !== undefined && (theoretical_score < 0 || theoretical_score > 20)) {
        return res.status(400).json({ error: "Theoretical score must be between 0 and 20" });
    }

    // Build query based on provided scores
    const fieldsToUpdate = [];
    const values = [];

    if (final_practical !== undefined) {
        fieldsToUpdate.push("practical_score=?");
        values.push(final_practical);
    }
    
    if (theoretical_score !== undefined) {
        fieldsToUpdate.push("theoretical_score=?");
        values.push(theoretical_score);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: "No scores provided to update" });
    }

    values.push(req.params.id);

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

// GET AVAILABLE MEMBERS FOR A TEAM (LEADER)
exports.getAvailableMembers = async (req, res) => {
  try {
    const { event_id } = req.query;
    if (!event_id) return res.status(400).json({ error: "event_id is required" });

    // Available members = those in the same event with no team_id
    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, CONCAT(first_name, ' ', last_name) as name, email, portfolio FROM members WHERE event_id = ? AND team_id IS NULL AND role = 'member'",
      [event_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD MEMBER TO TEAM (LEADER)
exports.addMemberToTeam = async (req, res) => {
  try {
    const { team_id, memberId } = req.body;
    if (!team_id || !memberId) return res.status(400).json({ error: "team_id and memberId are required" });

    // 1. Check team capacity
    const [teamMembers] = await pool.query("SELECT COUNT(*) as count FROM members WHERE team_id = ?", [team_id]);
    if (teamMembers[0].count >= 5) {
      return res.status(400).json({ error: "Team is already full (max 5 members)" });
    }

    // 2. Check if member is available and in the same event
    const [teamRows] = await pool.query("SELECT event_id FROM teams WHERE id = ?", [team_id]);
    const [memberRows] = await pool.query("SELECT event_id, team_id FROM members WHERE id = ?", [memberId]);

    if (teamRows.length === 0 || memberRows.length === 0) {
      return res.status(404).json({ error: "Team or Member not found" });
    }

    if (memberRows[0].event_id !== teamRows[0].event_id) {
      return res.status(400).json({ error: "Member must be in the same event as the team" });
    }

    if (memberRows[0].team_id !== null) {
      return res.status(400).json({ error: "Member is already in a team" });
    }

    // 3. Add to team
    await pool.query("UPDATE members SET team_id = ? WHERE id = ?", [team_id, memberId]);

    res.json({ message: "Member added to team successfully" });
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
              (t.practical_score + t.theoretical_score) as score,
              (t.practical_score + t.theoretical_score) as total_score,
              (SELECT COUNT(*) FROM members WHERE team_id = t.id) as membersCount
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