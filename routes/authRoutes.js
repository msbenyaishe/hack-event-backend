const express = require("express");
const router = express.Router();

const { login, logout } = require("../controllers/authController");

const { loginMember, logoutMember } = require("../controllers/memberAuthController");
router.post("/login", login);
router.post("/logout", logout);
router.post("/member/login", loginMember);
router.post("/member/logout", logoutMember);
module.exports = router;