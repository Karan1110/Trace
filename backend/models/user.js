const Sequelize = require("sequelize")
const db = require("../startup/db")
const jwt = require("jsonwebtoken")
const Notification = require("./notification")

const User = db.define(
  "User",
  {
    name: Sequelize.STRING,
    email: {
      type: Sequelize.STRING,
      unique: true,
    },
    password: Sequelize.STRING,
    department_id: Sequelize.INTEGER,
    total_meetings: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    attended_meetings: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    blockedUsers: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
    },
    followedUsers: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
    },
    points: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
)

User.hasMany(Notification, {
  as: "Notification",
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

User.prototype.generateAuthToken = function () {
  const token = jwt.sign(
    { id: this.getDataValue("id"), isadmin: this.getDataValue("isadmin") },
    "karan112010"
  )
  return token
}

module.exports = User
