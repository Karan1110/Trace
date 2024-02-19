const Sequelize = require("sequelize")

module.exports = new Sequelize(
  "postgres://jqsmcexd:fbz0ucMzDtTmlS1Tt4J32UwENR9eoVlL@mahmud.db.elephantsql.com/jqsmcexd",
  {
    logging: false,
    alter: true,
    sync: true,
    force: false,
  }
)
