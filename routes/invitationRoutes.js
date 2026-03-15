const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const memberAuth = require("../middleware/memberAuth")
const isLeader = require("../middleware/isLeader");

const {
  createLeaderInvite,
  joinAsLeader,
  createTeamInvite,
  joinTeam
} = require("../controllers/invitationController");

router.post("/leader", auth, createLeaderInvite);

router.post("/leader/join", joinAsLeader);

router.post("/team", memberAuth, isLeader, createTeamInvite);

router.post("/team/join", joinTeam);

module.exports = router;