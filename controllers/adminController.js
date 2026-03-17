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
      const { role } = req.body; 
      
      if(role !== 'leader' && role !== 'member') {
          return res.status(400).json({ error: "Invalid role" });
      }
      
      const [memberRows] = await pool.query("SELECT * FROM members WHERE id=?", [id]);
      if(memberRows.length === 0) return res.status(404).json({ error: "Member not found" });

      const targetMember = memberRows[0];

      await pool.query("START TRANSACTION");

      try {
        if (role === 'leader') {
          // Just update the role. Team creation is handled by the leader later.
          await pool.query("UPDATE members SET role='leader' WHERE id=?", [id]);
        } else {
          // Downgrading to member: If they were a leader of a team, we must handle it.
          // According to the requirement: "a team should have only and necessary one leader."
          // If we remove the leader, we disband the team.
          const [teams] = await pool.query("SELECT id FROM teams WHERE leader_id = ?", [id]);
          for (const t of teams) {
            // Set all members' team_id to NULL before deleting the team (handled by trigger/cascade too but let's be explicit if needed)
            // The trigger 'before_team_delete' already handles this by:
            // - deleting 'member' role users
            // - setting team_id = NULL for 'leader' role (which is the one being deleted here)
            // However, we are changing this user to 'member' now.
            await pool.query("UPDATE members SET team_id = NULL WHERE team_id = ?", [t.id]);
            await pool.query("DELETE FROM teams WHERE id = ?", [t.id]);
          }
          
          await pool.query("UPDATE members SET role='member', team_id=NULL WHERE id=?", [id]);
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
