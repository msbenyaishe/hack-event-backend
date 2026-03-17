const pool = require("../config/db");

// GET ALL MEMBERS
exports.getMembers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, CONCAT(first_name, ' ', last_name) as name, email, portfolio, role, event_id, team_id, created_at FROM members ORDER BY created_at DESC"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE MEMBER
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if member is a leader
    const [rows] = await pool.query("SELECT role, team_id FROM members WHERE id=?", [id]);

    if(rows.length === 0){
        return res.status(404).json({ error: "Member not found" });
    }

    const { role, team_id } = rows[0];

    if (role === 'leader' && team_id) {
        // Find if team is already deleted, if not we must be careful.
        // Actually best is to just delete the team as well if the leader is deleted. 
        // We have ON DELETE CASCADE for leader_id in teams, so deleting a leader deletes the team.
        // Let's rely on that cascade.
    }

    await pool.query(
      "DELETE FROM members WHERE id=?",
      [id]
    );

    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE MEMBER ROLE
exports.updateMemberRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role, team_id } = req.body; // Allow optional team_id
      
      if(role !== 'leader' && role !== 'member') {
          return res.status(400).json({ error: "Invalid role" });
      }
      
      const [memberRows] = await pool.query("SELECT * FROM members WHERE id=?", [id]);
      if(memberRows.length === 0) return res.status(404).json({ error: "Member not found" });

      // Lazy migration: Ensure leader_id in teams can be NULL
      await pool.query("ALTER TABLE teams MODIFY leader_id INT NULL").catch(err => {
        // Silently fail if already altered or other non-critical error
        console.log("[DB FIX] leader_id modification skipped/failed:", err.message);
      });
      
      const targetMember = memberRows[0];
      const currentTeamId = team_id || targetMember.team_id;

      await pool.query("START TRANSACTION");

      try {
        if (role === 'leader') {
          if (currentTeamId) {
            // Check if team exists
            const [teamRows] = await pool.query("SELECT * FROM teams WHERE id=?", [currentTeamId]);
            if (teamRows.length === 0) throw new Error("Team not found");
            const team = teamRows[0];

            // 1. Downgrade old leader if exists
            if (team.leader_id && team.leader_id !== parseInt(id)) {
              await pool.query("UPDATE members SET role='member' WHERE id=?", [team.leader_id]);
            }

            // 2. Update team leader_id
            await pool.query("UPDATE teams SET leader_id=? WHERE id=?", [id, currentTeamId]);

            // 3. Update member role and team_id
            await pool.query("UPDATE members SET role='leader', team_id=? WHERE id=?", [currentTeamId, id]);
          } else {
            // Create new team if no team_id
            const teamName = `${targetMember.first_name} Team`;
            const [teamRes] = await pool.query(
              "INSERT INTO teams (name, event_id, leader_id) VALUES (?, ?, ?)",
              [teamName, targetMember.event_id, id]
            );
            await pool.query("UPDATE members SET role='leader', team_id=? WHERE id=?", [teamRes.insertId, id]);
          }
        } else {
          // Downgrading to member
          try {
            // 1. Try to nullify leader_id in teams
            await pool.query("UPDATE teams SET leader_id = NULL WHERE leader_id = ?", [id]);
          } catch (nullErr) {
            // 2. If it fails (likely due to NOT NULL constraint), disband the team
            // but keep the members (set their team_id to NULL)
            const [teams] = await pool.query("SELECT id FROM teams WHERE leader_id = ?", [id]);
            for (const t of teams) {
              await pool.query("UPDATE members SET team_id = NULL WHERE team_id = ?", [t.id]);
              await pool.query("DELETE FROM teams WHERE id = ?", [t.id]);
            }
          }
          
          // 3. Set their role to member
          await pool.query("UPDATE members SET role='member' WHERE id=?", [id]);
        }

        await pool.query("COMMIT");
        res.json({ message: "Role updated successfully" });
      } catch (txErr) {
        await pool.query("ROLLBACK");
        res.status(400).json({ error: txErr.message });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
