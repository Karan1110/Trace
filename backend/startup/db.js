const Sequelize = require("sequelize")
const config = require("config")

module.exports = new Sequelize(config.get("dbURL"), {
  logging: false,
  alter: true,
  sync: true,
  force: false,
})
