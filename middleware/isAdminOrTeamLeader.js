const pool = require("../config/db");

module.exports = async (req, res, next) => {
  const isAdmin = (req.user && req.user.role === 'admin') || req.session.adminId;
  const memberId = req.user?.id || req.session.memberId;

  if (isAdmin) {
    return next();
  }

  if (!memberId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const teamId = req.params.id || req.body.team_id;

    if (!teamId) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    const [rows] = await pool.query(
      "SELECT leader_id FROM teams WHERE id=?",
      [teamId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (rows[0].leader_id === memberId) {
      return next();
    }

    res.status(403).json({ error: "Access denied. Only the team leader or admin can perform this action." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};