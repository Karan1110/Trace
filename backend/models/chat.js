const Sequelize = require("sequelize");
const db = require("../startup/db");
const Channel = require("./channel");

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
    type: {
      type: Sequelize.ENUM("channel", "group"),
      defaultValue: "group",
    },
    inviteCode: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4(),
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
