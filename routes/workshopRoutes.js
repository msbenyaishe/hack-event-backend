const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

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

// Admin Only
router.post("/", auth, createWorkshop);
router.put("/:id", auth, updateWorkshop);
router.delete("/:id", auth, deleteWorkshop);

module.exports = router;
