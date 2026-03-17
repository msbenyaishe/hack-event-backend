const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerMember = async (req, res) => {
  const { first_name, last_name, email, password, portfolio, event_id } = req.body;

  if (!first_name || !last_name || !email || !password || !event_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if user already exists
    const [existing] = await pool.query("SELECT id FROM members WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO members (first_name, last_name, email, password_hash, portfolio, role, event_id, team_id) VALUES (?, ?, ?, ?, ?, 'member', ?, NULL)",
      [first_name, last_name, email, password_hash, portfolio || null, event_id]
    );

    res.status(201).json({
      message: "Member registered successfully",
      member_id: result.insertId
    });
  } catch (err) {
    console.error("[REGISTER ERROR]", err);
    res.status(500).json({ error: err.message });
  }
};

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

    if (req.session) {
      req.session.memberId = member.id;
      req.session.save((err) => {
        if (err) {
          console.error("[SESSION SAVE ERROR]", err);
        }
      });
    }

    res.json({
      message: "Logged in",
      token: token,
      member_id: member.id,
      role: member.role
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