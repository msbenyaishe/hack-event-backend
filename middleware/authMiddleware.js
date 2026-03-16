const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'hackathon_secret_777');
      
      // Set IDs for backward compatibility with session-based controllers
      if (decoded.role === 'admin') {
        req.session.adminId = decoded.id;
      } else if (decoded.role === 'member' || decoded.role === 'leader') {
        req.session.memberId = decoded.id;
      }
      
      req.user = decoded;
      return next();
    } catch (err) {
      console.warn("[AUTH] Invalid Token:", err.message);
    }
  }

  // 2. Fallback to existing session (for routes not using JWT yet)
  if (req.session && (req.session.adminId || req.session.memberId)) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
};