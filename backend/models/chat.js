const Sequelize = require("sequelize")
const db = require("../startup/db")
const Channel = require("./channel")

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
    type: Sequelize.ENUM("channel", "group"),
  },
  {
    timestamps: true,
  }
)

Channel.belongsTo(Chat, {
  as: "chat",
  foreignKey: "chat_id",
})

Chat.hasMany(Channel, {
  as: "channels",
  foreignKey: "chat_id",
})

module.exports = Chat
