const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { login, email, password } = req.body;
  const identifier = login || email;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE login = ?",
      [identifier]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid login or email" });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      { id: admin.id, login: admin.login, role: 'admin' },
      process.env.SESSION_SECRET || 'hackathon_secret_777',
      { expiresIn: '24h' }
    );

    req.session.adminId = admin.id;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save session" });
      }
      res.json({ 
        message: "Logged in", 
        token: token,
        user: { id: admin.id, login: admin.login, role: 'admin' } 
      });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {

  delete req.session.adminId;

  res.json({ message: "Logged out" });

};