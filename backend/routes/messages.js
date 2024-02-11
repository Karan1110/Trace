const express = require("express")
const router = express.Router()
const app = express()
const auth = require("../middlewares/auth")
const Message = require("../models/message")
const isadmin = require("../middlewares/isAdmin.js")
/*
router.post("/", [auth, isadmin], async (req, res) => {
  const message = await Message.create({
    message: req.body.message,
    user_id: req.body.user_id,
  })

  // Broadcast the new message to all connected WebSocket clients
  app.getWss().clients.forEach((client) => {
    client.send(JSON.stringify(message))
  })

  res.status(200).send(message)
})
*/

router.put("/:id", [auth], async (req, res) => {
  const message = await Message.findOne({
    where: {
      id: req.params.id,
    },
  })

  if (message.user_id == req.user.id || req.user.isadmin == true) {
    await Message.update(
      {
        message: req.body.message,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    )
    return res.status(200).send(message)
  }

  res
    .status(403)
    .send("not allowed to update other's message unless you are a admin")
})

router.delete("/", [auth, isadmin], async (req, res) => {
  const message = await Message.findByPk(req.body.message_id)
  if (!message) return res.status(400).send("message not found")
  await Message.destroy({
    where: {
      id: req.body.message_id,
    },
  })

  res.status(200).send(message)
})

module.exports = router
