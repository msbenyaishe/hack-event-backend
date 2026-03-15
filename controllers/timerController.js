const pool = require("../config/db");

// Helper to ensure global timer exists
const ensureGlobalTimerExists = async () => {
    const [rows] = await pool.query("SELECT id FROM timers WHERE id=1");
    if (rows.length === 0) {
        await pool.query("INSERT INTO timers (id, status, remaining_seconds) VALUES (1, 'not_started', 0)");
    }
};

// GET GLOBAL TIMER
exports.getEventTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    const [rows] = await pool.query("SELECT * FROM timers WHERE id=1");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// START TIMER (Accepts duration in seconds)
exports.startTimer = async (req, res) => {
  try {
    const { duration } = req.body; // duration in seconds
    if (!duration) return res.status(400).json({ error: "Duration is required" });

    await ensureGlobalTimerExists();
    // end_time = NOW() + duration
    const query = `
      UPDATE timers 
      SET status='running', 
          start_time=NOW(), 
          end_time=DATE_ADD(NOW(), INTERVAL ? SECOND),
          remaining_seconds=?
      WHERE id=1
    `;
    await pool.query(query, [duration, duration]);
    res.json({ message: "Timer started" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PAUSE TIMER
exports.pauseTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    
    // Calculate remaining seconds: TIMESTAMPDIFF(SECOND, NOW(), end_time)
    const [rows] = await pool.query("SELECT end_time FROM timers WHERE id=1");
    if (rows.length === 0 || !rows[0].end_time) {
        return res.status(400).json({ error: "Timer not running" });
    }

    const [diffRows] = await pool.query("SELECT TIMESTAMPDIFF(SECOND, NOW(), ?) as diff", [rows[0].end_time]);
    const diff = Math.max(0, diffRows[0].diff);

    await pool.query("UPDATE timers SET status='paused', remaining_seconds=? WHERE id=1", [diff]);
    res.json({ message: "Timer paused", remaining_seconds: diff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESUME TIMER
exports.resumeTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    const [rows] = await pool.query("SELECT remaining_seconds FROM timers WHERE id=1");
    const remaining = rows[0]?.remaining_seconds || 0;

    const query = `
      UPDATE timers 
      SET status='running', 
          start_time=NOW(), 
          end_time=DATE_ADD(NOW(), INTERVAL ? SECOND)
      WHERE id=1
    `;
    await pool.query(query, [remaining]);
    res.json({ message: "Timer resumed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RESET TIMER
exports.finishTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    await pool.query("UPDATE timers SET status='not_started', start_time=NULL, end_time=NULL, remaining_seconds=0 WHERE id=1");
    res.json({ message: "Timer reset" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
