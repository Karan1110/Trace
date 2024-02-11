const winston = require("winston")
const Sequelize = require("sequelize")
const db = require("../startup/db")
const User = require("./user")

const Department = db.define("Department", {
  name: Sequelize.STRING,
})

User.belongsTo(Department, {
  as: "Department",
  foreignKey: "department_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

module.exports = Department
