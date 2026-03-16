const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.loginMember = async (req, res) => {

  const { email, password } = req.body;

  try {
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

    const token = jwt.sign(
      { id: member.id, email: member.email, role: member.role },
      process.env.SESSION_SECRET || 'hackathon_secret_777',
      { expiresIn: '24h' }
    );

    req.session.memberId = member.id;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save session" });
      }
      res.json({
        message: "Logged in",
        token: token,
        member_id: member.id,
        role: member.role
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.logoutMember = (req, res) => {

  delete req.session.memberId;

  res.json({
    message: "Logged out"
  });

};