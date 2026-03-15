const pool = require("../config/db");

// CREATE WORKSHOP
exports.createWorkshop = async (req, res) => {
  try {
    const { title, description, technology, duration, event_id } = req.body;

    const [result] = await pool.query(
      `INSERT INTO workshops (title, description, technology, duration, event_id)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, technology, duration, event_id]
    );

    res.json({ message: "Workshop created successfully", workshop_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL WORKSHOPS FOR EVENT
exports.getWorkshops = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM workshops WHERE event_id=?",
      [eventId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE WORKSHOP
exports.getWorkshop = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM workshops WHERE id=?",
      [id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: "Workshop not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE WORKSHOP
exports.updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technology, duration } = req.body;

    await pool.query(
      `UPDATE workshops
       SET title=?, description=?, technology=?, duration=?
       WHERE id=?`,
      [title, description, technology, duration, id]
    );

    res.json({ message: "Workshop updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE WORKSHOP
exports.deleteWorkshop = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM workshops WHERE id=?",
      [id]
    );

    res.json({ message: "Workshop deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
