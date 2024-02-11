const User = require("../models/user.js")

module.exports = async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: ["blockedUsers"],
  })

  req.blockedUsers = user.dataValues.blockedUsers

  next()
}
