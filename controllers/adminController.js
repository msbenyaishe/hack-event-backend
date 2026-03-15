const pool = require("../config/db");

// GET ALL MEMBERS
exports.getMembers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, first_name, last_name, email, portfolio, role, event_id, team_id, created_at FROM members ORDER BY created_at DESC"
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
    // If promoting a member to `leader`, verify the team logic: All other members in the same team must be downgraded to `member`, and the new leader formally becomes the `leader_id` of the `teams` table.
    // If an admin wants to downgrade the current team leader to a member, they MUST do it by upgrading someone else instead. This automatically downgrades everyone else. A direct downgrade of a team leader without a replacement will return a 400 error.
  
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      if(role !== 'leader' && role !== 'member') {
          return res.status(400).json({ error: "Invalid role" });
      }
      
      const [memberRows] = await pool.query("SELECT * FROM members WHERE id=?", [id]);
      
      if(memberRows.length === 0){
          return res.status(404).json({ error: "Member not found" });
      }
      
      const targetMember = memberRows[0];
      const teamId = targetMember.team_id;

      if (!teamId) {
          // If member is not in a team, just change their role
          await pool.query("UPDATE members SET role=? WHERE id=?", [role, id]);
          return res.json({ message: "Role updated" });
      }

      const [teamRows] = await pool.query("SELECT * FROM teams WHERE id=?", [teamId]);
      
      if(teamRows.length === 0){
        return res.status(404).json({ error: "Team not found" });
      }

      const team = teamRows[0];

      // Request to change from leader to member directly without a replacement
      if(role === 'member' && targetMember.role === 'leader' && team.leader_id === targetMember.id) {
          return res.status(400).json({ 
              error: "Cannot downgrade a team leader directly without a replacement. Upgrade another member to leader to automatically downgrade this leader." 
          });
      }

      // Request to upgrade a team member to leader
      if (role === 'leader' && targetMember.role === 'member') {
          
          await pool.query("START TRANSACTION");
          
          try {
             // 1. Create a NEW team for this person
             const teamName = `${targetMember.first_name} ${targetMember.last_name}`;
             const [teamRes] = await pool.query(
                 "INSERT INTO teams (name, event_id, leader_id) VALUES (?, ?, ?)",
                 [teamName, targetMember.event_id, id]
             );
             const newTeamId = teamRes.insertId;

             // 2. Update the target member's role and team_id
             await pool.query(
                 "UPDATE members SET role='leader', team_id=? WHERE id=?",
                 [newTeamId, id]
             );
             
             await pool.query("COMMIT");
             return res.json({ message: "Role updated to leader of a new team" });

          } catch (txErr) {
             await pool.query("ROLLBACK");
             throw txErr;
          }
      }
      
      // If it reaches here, it might be a redundant change (e.g. member to member)
      await pool.query("UPDATE members SET role=? WHERE id=?", [role, id]);
      res.json({ message: "Role updated" });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
