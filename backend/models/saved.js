const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user")
const Ticket = require("./ticket")

const Saved = db.define("Saved", {
  user_id: Sequelize.INTEGER,
  ticket_id: Sequelize.INTEGER,
})

Ticket.hasMany(Saved, {
  as: "TheSavedTickets",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

Saved.belongsTo(Ticket, {
  as: "savedTicket",
  foreignKey: "ticket_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

User.hasMany(Saved, {
  as: "mySavedTickets",
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

module.exports = Saved
