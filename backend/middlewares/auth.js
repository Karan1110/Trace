const jwt = require("jsonwebtoken")

module.exports = function (req, res, next) {
  if (!req.header("x-auth-token")) {
    return res.status(400).send("No token provided.")
  }
  try {
    const token = req.header("x-auth-token")
    const decoded = jwt.verify(token, "karan112010")
    req.user = decoded
    next()
  } catch (ex) {
    res.status(400).send("Invalid token.")
  }
}
