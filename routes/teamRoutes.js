const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadTeamLogo");
const isAdminOrTeamLeader = require("../middleware/isAdminOrTeamLeader");
const isAdminOrLeader = require("../middleware/isAdminOrLeader");
const memberAuth = require("../middleware/memberAuth")
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");

const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  removeTeamMember,
  updateScores,
  getScoreboard,
  getTeamMembers,
  getAvailableMembers,
  addMemberToTeam
} = require("../controllers/teamController");

router.post("/", auth, isAdminOrLeader, upload.single("logo"), createTeam);

router.get("/available", auth, isAdminOrLeader, getAvailableMembers);
router.post("/add-member", auth, isAdminOrTeamLeader, addMemberToTeam);

router.get("/scoreboard/:eventId", getScoreboard);

router.get("/", getTeams);

router.get("/:id", getTeam);

router.get("/:id/members", getTeamMembers);

router.put("/:id/scores", auth, isAdmin, upload.none(), updateScores); 

router.put("/:id", auth, isAdminOrTeamLeader, upload.single("logo"), updateTeam);

router.delete("/:id", auth, isAdminOrTeamLeader, deleteTeam);

router.delete("/:id/members/:memberId", auth, isAdminOrTeamLeader, removeTeamMember);

module.exports = router;