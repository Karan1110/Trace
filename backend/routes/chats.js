const Chat = require("../models/chat")
const Message = require("../models/message")
const router = require("express").Router()

router.get("/", async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: {
        chatRoom_id: req.query.chatRoom_id,
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
  let chatRoom = await Chat.findByPk(req.params.id)
  console.log(chatRoom)
  res.send(chatRoom)
})

module.exports = router
