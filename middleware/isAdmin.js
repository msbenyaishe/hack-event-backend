module.exports = (req, res, next) => {
  const isAdmin = (req.user && req.user.role === 'admin') || req.session.adminId;
  
  if (!isAdmin) {
    return res.status(401).json({ error: "Super Admin authentication required" });
  }
  next();
};
