const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user")
const Ticket = require("./ticket")

const Comment = db.define(
  "Comment",
  {
    content: Sequelize.TEXT,
    user_id: Sequelize.INTEGER,
    ticket_id: Sequelize.INTEGER,
  },
  {
    timestamps: true,
  }
)

Ticket.hasMany(Comment, {
  as: "Comments",
  foreignKey: "ticket_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

Comment.belongsTo(User, {
  as: "User", // Change the alias to "Sender"
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

module.exports = Comment
