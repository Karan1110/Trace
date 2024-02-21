const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user")
const Channel = require("./channel")

const Message = db.define(
  "Message",
  {
    id: { type: Sequelize.STRING, primaryKey: true },
    value: Sequelize.STRING,
    isRead: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    channel_id: Sequelize.INTEGER,
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

Message.belongsTo(Channel, {
  as: "channel",
  foreignKey: "channel_id",
})

Channel.hasMany(Message, {
  as: "messages",
  foreignKey: "channel_id",
})

Message.belongsTo(User, {
  as: "Sender", // Change the alias to "Sender"
  foreignKey: "user_id",
  onDelete: "CASCADE",
})

module.exports = Message
