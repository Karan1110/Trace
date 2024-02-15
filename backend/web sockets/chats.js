const Message = require("../models/message")
const User = require("../models/user")
const Sequelize = require("sequelize")
const Chat = require("../models/chat")
const ChatUser = require("../models/ChatUser")
const auth = require("./utils/auth")
const addToChannels = require("./utils/addToChannels")
const { produceMessage } = require("./utils/Kafka")
const { startConsumingMessages } = require("./utils/Kafka")

module.exports = function (app) {
  require("express-ws")(app)
  // TODO  - use db for this

  // Store WebSocket connections for each chat room
  const Chats = {}

  app.ws("/chat/:chat/:channel", auth, async (ws, req) => {
    try {
      let currentChat = await Chat.findByPk(req.params.chat, {
        include: {
          as: "Messages",
          model: Message,
        },
      })
      if (!currentChat) {
        currentChat = await Chat.create({
          id: req.params.chat,
          channels: [req.params.channel],
          type: req.query.type,
          name: req.query.name,
        })
      }

      const user = await User.findByPk(req.user.id)

      if (
        !currentChat.dataValues.channels.includes(
          req.params.channel || "general"
        )
      ) {
        addToChannels(Chat, req.params.channel, currentChat.id)
      }

      // Check if the chat room exists, create a new one if it doesn't
      const chatKey = `${req.params.chat}_${req.params.channel}`
      if (!Chats[chatKey]) {
        Chats[chatKey] = []
      }

      // Add the WebSocket connection to the chat room
      Chats[chatKey].push(ws)

      let chat_user = await ChatUser.findOne({
        where: {
          user_id: req.user.id,
          chat_id: currentChat.dataValues.id,
        },
      })

      if (!chat_user) {
        chat_user = await ChatUser.create({
          user_id: req.user.id,
          chat_id: currentChat.dataValues.id,
        })
      }

      await User.update(
        {
          isOnline: true,
        },
        {
          where: {
            id: req.user.id,
          },
        }
      )

      // Mark all messages as read

      await Message.update(
        { isRead: true },
        {
          where: {
            isRead: false,
            chat_id: currentChat.id || currentChat.dataValues.id,
            user_id: {
              [Sequelize.Op.notIn]: [req.user.id],
            },
          },
        }
      )

      // Get all messages for the current chat room
      const messages = currentChat.dataValues.Messages
      console.log(
        "these are the messages : ",
        messages,
        "chatData : ",
        currentChat
      )

      // Send all messages to the WebSocket connection and mark them as read
      if (messages.length > 0) {
        for (const msg of messages) {
          ws.send(
            JSON.stringify({
              id: msg.id,
              message: msg.value,
              user_id: msg.user_id,
              isRead: true, // Mark as read
              channel: msg.channel,
            })
          )
        }
      }

      startConsumingMessages(Chats, req, ws)

      // Handle incoming messages
      ws.on("message", async (msg) => {
        produceMessage(Chats, msg, ws, req)
      })
      ws.on("edit", async (msg, msgId) => {
        produceMessage(Chats, msg, ws, req, true, msgId)
      })
      // Handle WebSocket connection closure
      ws.on("close", async () => {
        await User.update(
          {
            isOnline: false,
            last_seen: new Date(),
          },
          {
            where: {
              id: user.dataValues.id,
            },
          }
        )

        // Remove the WebSocket connection from the chat room
        const chatKey = `${req.params.chat}_${req.params.channel}`
        Chats[chatKey] = Chats[chatKey].filter(
          (connection) => connection !== ws
        )
      })
    } catch (ex) {
      console.log("ERROR!!!")
      console.log(ex)
      ws.close(4000, ex.message)
    }
  })
}
