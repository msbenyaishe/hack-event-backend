const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadEventLogo");

const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getCurrentEvent,
  setCurrentEvent
} = require("../controllers/eventController");
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");


router.post("/", auth, isAdmin, upload.single("logo"), createEvent);
router.get("/", getEvents);
router.get("/current", getCurrentEvent);
router.get("/:id", getEvent);
router.put("/:id", auth, isAdmin, upload.single("logo"), updateEvent);
router.put("/:id/current", auth, isAdmin, setCurrentEvent);
router.delete("/:id", auth, isAdmin, deleteEvent);

module.exports = router;