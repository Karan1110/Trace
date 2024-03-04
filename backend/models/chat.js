const Sequelize = require("sequelize");
const db = require("../startup/db");
const Channel = require("./channel");

const Chat = db.define(
  "Chat", // Specify the desired table name here
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.ENUM("channel", "group", "personal"),
      defaultValue: "group",
    },
    inviteCode: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4(),
    },
    url: {
      type: Sequelize.STRING,
      defaultValue:
        "https://static.vecteezy.com/system/resources/previews/006/892/625/original/discord-logo-icon-editorial-free-vector.jpg",
    },
  },
  {
    timestamps: true,
  }
);

Channel.belongsTo(Chat, {
  as: "chat",
  foreignKey: "chat_id",
});

Chat.hasMany(Channel, {
  as: "channels",
  foreignKey: "chat_id",
});

module.exports = Chat;
