const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.loginMember = async (req, res) => {

  const { email, password } = req.body;

  const [rows] = await pool.query(
    "SELECT * FROM members WHERE email=?",
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  const member = rows[0];

  const valid = await bcrypt.compare(
    password,
    member.password_hash
  );

  if (!valid) {
    return res.status(401).json({
      error: "Invalid credentials"
    });
  }

  req.session.memberId = member.id;

  req.session.save((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save session" });
    }
    res.json({
      message: "Logged in",
      member_id: member.id,
      role: member.role
    });
  });

};


exports.logoutMember = (req, res) => {

  delete req.session.memberId;

  res.json({
    message: "Logged out"
  });

};