const Sequelize = require("sequelize");
const db = require("../startup/db");
const User = require("./user");

const Request = db.define(
  "Request",
  {
    sender_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    recipient_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    accepted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

Request.belongsTo(User, {
  as: "sender",
  foreignKey: "sender_id",
  onDelete: "CASCADE",
});

Request.belongsTo(User, {
  as: "recipient",
  foreignKey: "recipient_id",
  onDelete: "CASCADE",
});

module.exports = Request;
