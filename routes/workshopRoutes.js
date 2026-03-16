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
router.post("/", auth, isAdminOrLeader, createWorkshop);
router.put("/:id", auth, isAdminOrLeader, updateWorkshop);
router.delete("/:id", auth, isAdminOrLeader, deleteWorkshop);

module.exports = router;
