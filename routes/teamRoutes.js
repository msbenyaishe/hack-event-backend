const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadTeamLogo");
const isAdminOrTeamLeader = require("../middleware/isAdminOrTeamLeader");
const isAdminOrLeader = require("../middleware/isAdminOrLeader");
const memberAuth = require("../middleware/memberAuth")
const auth = require("../middleware/authMiddleware");

const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  removeTeamMember,
  updateScores,
  getScoreboard,
  getTeamMembers
} = require("../controllers/teamController");

router.post("/", isAdminOrLeader, upload.single("logo"), createTeam);

router.get("/scoreboard/:eventId", getScoreboard);

router.get("/", getTeams);

router.get("/:id", getTeam);

router.get("/:id/members", getTeamMembers);

router.put("/:id/scores", auth, upload.none(), updateScores); 

router.put("/:id",isAdminOrTeamLeader, upload.single("logo"), updateTeam);

router.delete("/:id",isAdminOrTeamLeader, deleteTeam);

router.delete("/:id/members/:memberId", isAdminOrTeamLeader, removeTeamMember);

module.exports = router;