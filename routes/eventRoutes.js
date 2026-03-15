const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadEventLogo");

const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getCurrentEvent
} = require("../controllers/eventController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, upload.single("logo"), createEvent);
router.get("/", getEvents);
router.get("/current", getCurrentEvent);
router.get("/:id", getEvent);
router.put("/:id", auth, upload.single("logo"), updateEvent);
router.delete("/:id", auth, deleteEvent);

module.exports = router;