const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const {
  submitWorkshop,
  getLeaderSubmissions,
  getAllSubmissions
} = require("../controllers/submissionController");

// Leaders submit or update their workshop links
router.post("/", auth, submitWorkshop);

// Leaders view their team's submissions
router.get("/mine", auth, getLeaderSubmissions);

// Admins view all submissions
router.get("/", auth, isAdmin, getAllSubmissions);

module.exports = router;
