const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getEventTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  finishTimer
} = require("../controllers/timerController");

// Public (or member auth, but public is fine for timer usually)
router.get("/event/global", getEventTimer);

// Admin Only
router.put("/event/global/start", auth, startTimer);
router.put("/event/global/pause", auth, pauseTimer);
router.put("/event/global/resume", auth, resumeTimer);
router.put("/event/global/finish", auth, finishTimer);

module.exports = router;
