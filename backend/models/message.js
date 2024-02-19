const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user")
const Chat = require("./chat")

const Message = db.define(
  "Message",
  {
    id: { type: Sequelize.STRING, primaryKey: true },
    value: Sequelize.STRING,
    isRead: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    chat_id: Sequelize.INTEGER,
    channel: Sequelize.STRING,
    user_id: Sequelize.INTEGER,
  },
  {
    timestamps: true,
  }
)

User.hasMany(Message, {
  as: "SentMessages", // Change the alias to "SentMessages"
  foreignKey: "user_id",
  onDelete: "CASCADE",
})

Message.belongsTo(Chat, {
  as: "Chat",
  foreignKey: "chat_id",
  onDelete: "CASCADE",
})

Chat.hasMany(Message, {
  as: "Messages",
  foreignKey: "chat_id",
  onDelete: "CASCADE",
})

Message.belongsTo(User, {
  as: "Sender", // Change the alias to "Sender"
  foreignKey: "user_id",
  onDelete: "CASCADE",
})

module.exports = Message
