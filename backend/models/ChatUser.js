const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user")
const Chat = require("./chat")

const ChatUser = db.define(
  "ChatUser",
  {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false, // Ensure user_id is not null
    },
    chat_id: {
      type: Sequelize.INTEGER,
      allowNull: false, // Ensure chat_id is not null
    },
    role: {
      type: Sequelize.ENUM("user", "moderator", "owner"),
      defaultValue: "user",
    },
  },
  {
    tablename: "ChatUser",
  }
)

ChatUser.belongsTo(User, { foreignKey: "user_id", as: "User" })
ChatUser.belongsTo(Chat, { foreignKey: "chat_id", as: "Chat" })

Chat.belongsToMany(User, {
  through: ChatUser,
  as: "Users",
  foreignKey: "chat_id",
  otherKey: "user_id",
})

User.belongsToMany(Chat, {
  through: ChatUser,
  as: "Chats",
  foreignKey: "user_id",
  otherKey: "chat_id",
})

module.exports = ChatUser
