const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const isAdminOrLeader = require("../middleware/isAdminOrLeader");


const {
  createWorkshop,
  getWorkshops,
  getWorkshop,
  updateWorkshop,
  deleteWorkshop
} = require("../controllers/workshopController");

// Public (or maybe authenticated? usually viewing is public, but let's leave it public for event members)
router.get("/event/:eventId", getWorkshops);
router.get("/:id", getWorkshop);

// Admin Or Leader
router.post("/", isAdminOrLeader, createWorkshop);
router.put("/:id", isAdminOrLeader, updateWorkshop);
router.delete("/:id", isAdminOrLeader, deleteWorkshop);

module.exports = router;
