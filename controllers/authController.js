const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { login, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE login = ?",
      [login]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid login" });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return res.status(401).json({ error: "Wrong password" });
    }

    req.session.adminId = admin.id;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to save session" });
      }
      res.json({ message: "Logged in", user: { id: admin.id, login: admin.login, role: 'admin' } });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = (req, res) => {

  delete req.session.adminId;

  res.json({ message: "Logged out" });

};