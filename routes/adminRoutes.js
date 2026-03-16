const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");


const {
  getMembers,
  deleteMember,
  updateMemberRole
} = require("../controllers/adminController");


router.get("/members", auth, isAdmin, getMembers);
router.delete("/members/:id", auth, isAdmin, deleteMember);
router.put("/members/:id/role", auth, isAdmin, updateMemberRole);



module.exports = router;
