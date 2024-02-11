const Sequelize = require("sequelize")
const db = require("../startup/db")

const Chat = db.define(
  "Chat", // Specify the desired table name here
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
    },
    channels: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: [],
    },
    type: Sequelize.ENUM("channel", "group"),
  },
  {
    timestamps: true,
  }
)

module.exports = Chat
