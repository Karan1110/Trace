const Sequelize = require("sequelize")
const db = require("../startup/db")
// const User = require("./user");

const Notification = db.define(
  "Notification",
  {
    message: Sequelize.STRING,
  },
  {
    indexes: [
      {
        fields: ["message"],
      },
    ],
  }
)

module.exports = Notification
