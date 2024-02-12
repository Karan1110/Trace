const Chat = require("../models/chat")
const Message = require("../models/message")
const router = require("express").Router()

router.get("/", async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        chat_id: req.query.chat_id,
        channel: req.query.channel,
      },
      limit: 20,
      offset: req.query.page * 20,
      order: [["createdAt", "ASC"]],
    })

    res.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

router.get("/:id", async (req, res) => {
  let chat = await Chat.findByPk(req.params.id)
  res.send(chat)
})

module.exports = router
