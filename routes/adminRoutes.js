const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const {
  getMembers,
  deleteMember,
  updateMemberRole
} = require("../controllers/adminController");


router.get("/members", auth, getMembers);
router.delete("/members/:id", auth, deleteMember);
router.put("/members/:id/role", auth, updateMemberRole);



module.exports = router;
