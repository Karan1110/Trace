const Chat = require("../models/chat")
const ChatUser = require("../models/ChatUser")
const Message = require("../models/message")
const router = require("express").Router()
const auth = require("../middlewares/auth")

const config = require("config")
const Channel = require("../models/channel")
const User = require("../models/user")
import("livekit-server-sdk").then(({ AccessToken }) => {
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
    let chat = await Chat.findByPk(req.params.id, {
      include: [
        {
          model: Channel,
          as: "channels",
        },
        {
          model: User,
          as: "Users",
        },
      ],
    })

    res.send(chat)
  })

  router.post("/", auth, async (req, res) => {
    const chat = await Chat.create({
      id: req.params.chat,
      type: req.body.type,
      name: req.body.name,
    })

    const chat_user = await ChatUser.create({
      user_id: req.user.id,
      chat_id: chat.dataValues.id,
      role: "owner",
    })
    const channel = await Channel.create({
      name: "general",
      chat_id: chat.dataValues.id,
      type: "text",
    })

    res.json({ chat, chat_user, channel })
  })

  router.post("/join/:chatId", auth, async (req, res) => {
    const chat_user = await ChatUser.create({
      user_id: req.user.id,
      chat_id: req.params.chatId,
    })
    res.json(chat_user)
  })

  router.post("/createChannel", auth, async (req, res) => {
    const channel = Channel.create({
      type: req.body.channel_type,
      name: req.body.name,
      chat_id: req.body.chat_id,
    })

    res.json({ channel: channel })
  })

  router.post("/joinChannel/:channel", auth, async (req, res) => {
    const roomName = req.params.channel
    const participantName = req.body.participantName

    const at = new AccessToken(
      config.get("LIVEKIT_API_KEY"),
      config.get("LIVEKIT_API_SECRET"),
      {
        identity: participantName,
      }
    )

    at.addGrant({ roomJoin: true, room: roomName })

    const token = await at.toJwt()
    console.log(token)
    res.send(token)
  })

  router.put("/promote/:chatId/:userId", auth, async (req, res) => {
    if (req.body.role != "owner" || "moderator")
      return res.status(400).send("invalid role...")

    const owner = await ChatUser.findOne({
      chat_id: req.params.chatId,
      user_id: req.user.id,
      role: "owner",
    })
    if (!owner) return res.status(403).send("not authorized...")

    await ChatUser.update(
      {
        role: req.body.role,
      },
      {
        where: {
          user_id: req.params.userId,
          chat_id: req.params.chatId,
        },
      }
    )

    res
      .status(200)
      .send(`promoted user ${req.params.userId} to ${req.body.role}`)
  })
})

module.exports = router
