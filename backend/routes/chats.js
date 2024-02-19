const Chat = require("../models/chat")
const ChatUser = require("../models/ChatUser")
const Message = require("../models/message")
const router = require("express").Router()
const auth = require("../middlewares/auth")

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
router.post("/", async (req, res) => {
  const chat = await Chat.create({
    id: req.params.chat,
    channels: [req.params.channel],
    type: req.body.type,
    name: req.body.name,
  })
  res.json(chat)
})

router.post("/join/:chatId", auth, async (req, res) => {
  const chat_user = await ChatUser.create({
    user_id: req.user.id,
    chat_id: req.params.chatId,
  })
  res.json(chat_user)
})

module.exports = router
