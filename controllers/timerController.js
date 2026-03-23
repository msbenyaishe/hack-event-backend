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
    const [rows] = await pool.query(`
      SELECT 
        id, 
        status, 
        start_time as startTime, 
        end_time as endTime, 
        remaining_seconds as remainingSeconds 
      FROM timers WHERE id=1
    `);
    
    let timer = rows[0];
    const now = new Date();
    
    // Calculate real-time remaining seconds if running
    if (timer.status === 'running' && timer.endTime) {
      const end = new Date(timer.endTime);
      // Use Math.round to avoid immediate "1s drop" visual issue
      timer.remainingSeconds = Math.max(0, Math.round((end - now) / 1000));
      
      if (timer.remainingSeconds <= 0) {
        timer.status = 'finished';
        await pool.query("UPDATE timers SET status='finished', remaining_seconds=0 WHERE id=1");
      }
    }
    
    res.json({
      ...timer,
      serverTime: now.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// START TIMER (Accepts duration in seconds)
exports.startTimer = async (req, res) => {
  try {
    let { duration } = req.body; // duration in seconds
    if (!duration) duration = 86400; // Default 24h

    await ensureGlobalTimerExists();
    
    const now = new Date();
    const endTime = new Date(now.getTime() + duration * 1000);

    const query = `
      UPDATE timers 
      SET status='running', 
          start_time=?, 
          end_time=?,
          remaining_seconds=?
      WHERE id=1
    `;
    await pool.query(query, [now, endTime, duration]);
    res.json({ message: "Timer started", duration, endTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PAUSE TIMER
exports.pauseTimer = async (req, res) => {
  try {
    await ensureGlobalTimerExists();
    
    const [rows] = await pool.query("SELECT end_time FROM timers WHERE id=1");
    if (rows.length === 0 || !rows[0].end_time) {
        return res.status(400).json({ error: "Timer not running" });
    }

    const now = new Date();
    const end = new Date(rows[0].end_time);
    const diff = Math.max(0, Math.round((end - now) / 1000));

    await pool.query("UPDATE timers SET status='paused', remaining_seconds=? WHERE id=1", [diff]);
    res.json({ message: "Timer paused", remainingSeconds: diff });
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

    const now = new Date();
    const endTime = new Date(now.getTime() + remaining * 1000);

    const query = `
      UPDATE timers 
      SET status='running', 
          start_time=?, 
          end_time=?
      WHERE id=1
    `;
    await pool.query(query, [now, endTime]);
    res.json({ message: "Timer resumed", remainingSeconds: remaining, endTime });
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

