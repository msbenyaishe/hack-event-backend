const pool = require("../config/db");

module.exports = async (req, res, next) => {

  const isAdmin = (req.user && req.user.role === 'admin') || req.session.adminId;
  if (isAdmin) {
    return next();
  }

  try {
    const memberId = req.user?.id || req.session.memberId; 

    if (!memberId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [rows] = await pool.query(
        "SELECT role FROM members WHERE id=?",
        [memberId]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: "Member not found" });
    }

    const isLeader = (req.user && req.user.role === 'leader') || rows[0].role === "leader";

    if (!isLeader) {
        return res.status(403).json({
          error: "Only leaders can perform this action"
        });
    }

    next();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};