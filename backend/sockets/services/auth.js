const jwt = require("jsonwebtoken")

module.exports = (ws, req, next) => {
  if (!req.query.xAuthToken) {
    return ws.close(4000, "No token provided.")
  }
  try {
    const token = req.query.xAuthToken
    const decoded = jwt.verify(token, "karan112010")
    req.user = decoded
    next()
  } catch (ex) {
    ws.close(4000, `${ex.message}`)
  }
}
