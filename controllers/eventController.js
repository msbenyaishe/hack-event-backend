const pool = require("../config/db");

const formatEventDates = (event) => {
  if (event.start_date && typeof event.start_date === 'string') {
    event.start_date = event.start_date.replace(' ', 'T');
  }
  if (event.end_date && typeof event.end_date === 'string') {
    event.end_date = event.end_date.replace(' ', 'T');
  }
  return event;
};

// CREATE EVENT
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      start_date,
      end_date,
      location,
      status,
      max_leaders,
      max_team_members
    } = req.body;

    const logo = req.file ? req.file.path : null;

    if (status === 'current') {
      await pool.query("UPDATE events SET status='finished' WHERE status='current'");
    }

    const query = `
      INSERT INTO events
      (name, description, logo, start_date, end_date, location, status, max_leaders, max_team_members)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      name,
      description,
      logo,
      start_date,
      end_date,
      location,
      status || 'waiting',
      max_leaders || 4,
      max_team_members || 5
    ]);

    res.json({ message: "Event created successfully", id: result.insertId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET ALL EVENTS
exports.getEvents = async (req, res) => {

  try {

    const [rows] = await pool.query(
      "SELECT * FROM events ORDER BY created_at DESC"
    );

    res.json(rows.map(formatEventDates));

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// GET SINGLE EVENT
exports.getEvent = async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM events WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(formatEventDates(rows[0]));

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// UPDATE EVENT
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      start_date,
      end_date,
      location,
      status,
      max_leaders,
      max_team_members
    } = req.body;

    let logo = null;
    if (req.file) {
      logo = req.file.path;
    }
    
    if (status === 'current') {
      await pool.query("UPDATE events SET status='finished' WHERE status='current' AND id != ?", [id]);
    }

    let query;
    let params;

    if (logo) {
      query = `
        UPDATE events
        SET name=?, description=?, logo=?, start_date=?, end_date=?, location=?, status=?, max_leaders=?, max_team_members=?
        WHERE id=?
      `;
      params = [name, description, logo, start_date, end_date, location, status, max_leaders, max_team_members, id];
    } else {
      query = `
        UPDATE events
        SET name=?, description=?, start_date=?, end_date=?, location=?, status=?, max_leaders=?, max_team_members=?
        WHERE id=?
      `;
      params = [name, description, start_date, end_date, location, status, max_leaders, max_team_members, id];
    }

    await pool.query(query, params);
    res.json({ message: "Event updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE EVENT
exports.deleteEvent = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query(
      "DELETE FROM events WHERE id = ?",
      [id]
    );

    res.json({ message: "Event deleted" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


exports.getCurrentEvent = async (req, res) => {

  try {

    const [rows] = await pool.query(
      "SELECT * FROM events WHERE status='current' LIMIT 1"
    );

    if (rows.length > 0) {
      return res.json(formatEventDates(rows[0]));
    }

    const [fallbackRows] = await pool.query(
      "SELECT * FROM events ORDER BY created_at DESC LIMIT 1"
    );

    if (fallbackRows.length === 0) {
      return res.status(404).json({
        error: "No events found in the database"
      });
    }

    res.json(formatEventDates(fallbackRows[0]));

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};