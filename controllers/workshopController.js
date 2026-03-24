const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

const formatWorkshopDates = (workshop) => {
  if (workshop.start_time && typeof workshop.start_time === 'string') {
    workshop.start_time = workshop.start_time.replace(' ', 'T');
  }
  return workshop;
};

// CREATE WORKSHOP
exports.createWorkshop = async (req, res) => {
  try {
    const { title, description, technology, duration, event_id, eventId, start_time, location, link } = req.body;
    const final_event_id = event_id || eventId;

    let final_link = link || null;

    // Foreign Key Constraint Fix:
    // workshops.responsible_admin references members(id).
    // If an Admin (from admins table) is creating this, we should NOT put their ID here.
    let final_responsible_admin = null;
    if (req.user && req.user.role !== 'admin') {
      final_responsible_admin = req.user.id;
    } else if (req.session?.memberId) {
      final_responsible_admin = req.session.memberId;
    }

    if (!req.user && !req.session?.adminId && !req.session?.memberId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const [result] = await pool.query(
      `INSERT INTO workshops (title, description, technology, duration, event_id, responsible_admin, start_time, location, link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, 
        description, 
        technology, 
        parseInt(duration) || 0, 
        final_event_id, 
        final_responsible_admin,
        start_time || null,
        location || null,
        final_link
      ]
    );

    res.json({ message: "Workshop created successfully", workshop_id: result.insertId });
  } catch (err) {
    console.error("[WORKSHOP CREATE ERROR]", err);
    res.status(500).json({ error: err.message });
  }
};

// GET ALL WORKSHOPS FOR EVENT
exports.getWorkshops = async (req, res) => {
  try {
    const { eventId } = req.params;

    const [rows] = await pool.query(
      `SELECT w.*, CONCAT(m.first_name, ' ', m.last_name) as responsible_admin_name
       FROM workshops w
       LEFT JOIN members m ON w.responsible_admin = m.id
       WHERE w.event_id=?`,
      [eventId]
    );

    res.json(rows.map(formatWorkshopDates));
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

    res.json(formatWorkshopDates(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE WORKSHOP
exports.updateWorkshop = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technology, duration, start_time, location, link } = req.body;

    let final_link = link || null;

    await pool.query(
      `UPDATE workshops
       SET title=?, description=?, technology=?, duration=?, start_time=?, location=?, link=?
       WHERE id=?`,
      [title, description, technology, duration, start_time || null, location || null, final_link, id]
    );

    res.json({ message: "Workshop updated" });
  } catch (err) {
    console.error("[WORKSHOP UPDATE ERROR]", err);
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

// LIST PDFS
exports.listPdfs = async (req, res) => {
  try {
    const pdfDir = path.join(__dirname, "../pdfs");
    if (!fs.existsSync(pdfDir)) {
      return res.json([]);
    }
    const files = fs.readdirSync(pdfDir);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    res.json(pdfFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
