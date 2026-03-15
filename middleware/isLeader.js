const pool = require("../config/db");

module.exports = async (req, res, next) => {

  const memberId = req.session.memberId;

  const [rows] = await pool.query(
    "SELECT role FROM members WHERE id=?",
    [memberId]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Member not found" });
  }

  if (rows[0].role !== "leader") {
    return res.status(403).json({
      error: "Only leaders can perform this action"
    });
  }

  next();

};