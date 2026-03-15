const pool = require("../config/db");

module.exports = async (req, res, next) => {

  try {

    const memberId = req.session.memberId; 
    const teamId = req.params.id || req.body.team_id;

    if (!memberId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [rows] = await pool.query(
      "SELECT leader_id FROM teams WHERE id=?",
      [teamId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (rows[0].leader_id !== memberId) {
      return res.status(403).json({ error: "Not the leader of this team" });
    }

    next();

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};