const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

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
router.put("/event/global/start", isAdmin, startTimer);
router.put("/event/global/pause", isAdmin, pauseTimer);
router.put("/event/global/resume", isAdmin, resumeTimer);
router.put("/event/global/finish", isAdmin, finishTimer);

module.exports = router;
