const Sequelize = require("sequelize")
const db = require("../startup/db")

const Channel = db.define(
  "Channel", // Specify the desired table name here
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM("audio", "video", "text"),
      defaultValue: "text",
    },
    chat_id: Sequelize.INTEGER,
  },
  {
    timestamps: true,
  }
)

module.exports = Channel
