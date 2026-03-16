module.exports = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: "Super Admin authentication required" });
  }
  next();
};
