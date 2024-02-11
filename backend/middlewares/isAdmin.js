module.exports = function (req, res, next) {
  if (req.user.isadmin === false) return res.status(401).send("not authorized");
  next();
};
