const Sequelize = require("sequelize");
const db = require("../startup/db");
const User = require("./user");

const Department = db.define("Department", {
  name: Sequelize.STRING,
  url: Sequelize.STRING,
});

User.belongsTo(Department, {
  as: "Department",
  foreignKey: "department_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Department.hasMany(User, {
  as: "users",
  foreignKey: "department_id",
});

module.exports = Department;
