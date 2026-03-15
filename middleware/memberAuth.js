module.exports = (req, res, next) => {

  if (!req.session.memberId) {
    return res.status(401).json({
      error: "Member not authenticated"
    });
  }

  next();

};