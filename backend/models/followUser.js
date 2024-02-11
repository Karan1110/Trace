const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user.js")

const FollowUser = db.define("FollowUser", {
  following_id: Sequelize.INTEGER,
  followedBy_id: Sequelize.INTEGER,
})

FollowUser.belongsTo(User, {
  as: "followedBy",
  foreignKey: "followedBy_id",
  onDelete: "CASCADE",
})

FollowUser.belongsTo(User, {
  as: "following",
  foreignKey: "following_id",
  onDelete: "CASCADE",
})

User.hasMany(FollowUser, {
  as: "followers",
  foreignKey: "following_id",
  onDelete: "CASCADE",
})

module.exports = FollowUser
