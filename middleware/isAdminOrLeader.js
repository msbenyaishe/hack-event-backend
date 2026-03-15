const pool = require("../config/db");
module.exports = async (req, res, next) => {

  if (req.session.adminId) {
    //return res.status(401).json({ error: "Unauthorized" });
    return next();
  }

  try {

    const memberId = req.session.memberId; 

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

    if (rows[0].role !== "leader") {
        return res.status(403).json({
        error: "Only leaders can perform this action"
        });
    }

    next();

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};