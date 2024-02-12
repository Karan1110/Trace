const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user")
const Chat = require("./chat")

const ChatUser = db.define(
  "ChatUser",
  {
    user_id: Sequelize.INTEGER,
    chat_id: Sequelize.INTEGER,
  },
  {
    tablename: "ChatUser",
  }
)

ChatUser.belongsTo(User, {
  as: "User",
  foreignKey: "user_id",
})

ChatUser.belongsTo(Chat, {
  as: "Chat",
  foreignKey: "chat_id",
})
Chat.belongsToMany(User, {
  as: "Users",
  through: ChatUser,
})

User.belongsToMany(Chat, {
  as: "Chats",
  through: ChatUser,
})

module.exports = ChatUser
