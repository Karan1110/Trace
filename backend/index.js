const express = require("express")
const app = express()
const db = require("./startup/db")
const winston = require("winston")

require("./startup/logging")()
require("./startup/routes")(app)

db.authenticate()
  .then(() => {
    winston.info("Database connected...")
    db.sync()
      .then(() => {
        // winston.info("Tables created....")
      })
      .catch((ex) => {
        winston.info("Tables NOT created...", ex.message, ex)
      })
  })
  .catch((ex) => {
    winston.error("Database NOT connected...", ex)
  })

app.listen(1111, () => {
  winston.info("Listening on  http://localhost:1111")
})
