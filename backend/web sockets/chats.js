const Message = require("../models/message")
const User = require("../models/user")
const Chat = require("../models/chat")
const ChatUser = require("../models/ChatUser")
const auth = require("./utils/auth")
const addToChannels = require("./utils/addToChannels")
const { produceMessage } = require("./utils/Kafka")
const { startConsumingMessages } = require("./utils/Kafka")
const { v4: uuidv4 } = require("uuid")

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
      const user = await User.findByPk(req.user.id)

      if (!currentChat || !user) {
        ws.close("chat not found")
      }

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
      // TODO: use Kafka here...
      // Mark all messages as read
      // await Message.update(
      //   { isRead: true },
      //   {
      //     where: {
      //       isRead: false,
      //       chat_id: currentChat.id || currentChat.dataValues.id,
      //       user_id: {
      //         [Sequelize.Op.notIn]: [req.user.id],
      //       },
      //     },
      //   }
      // )

      // Get all messages for the current chat room
      const messages = currentChat.dataValues.Messages

      // Send all messages to the WebSocket connection and mark them as read
      if (messages && messages.length > 0) {
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

      startConsumingMessages()

      // Handle incoming messages
      ws.on("message", async (msg) => {
        const regex = /edit-message-karan112010/
        if (regex.test(msg)) {
          const temp = msg.split("=")
          const message_id = temp[temp.length - 1]
          const temp2 = msg.split("~")
          const value = temp2[0]
          Chats[`${req.params.chat}_${req.params.channel}`].forEach(
            (connection) => {
              connection.send(
                JSON.stringify({
                  id: message_id,
                  value: value,
                  edited: true,
                })
              )
            }
          )
          produceMessage(Chats, msg, ws, req, true, message_id)
        } else {
          const id = uuidv4().toString()
          Chats[`${req.params.chat}_${req.params.channel}`].forEach(
            (connection) => {
              console.log("the value of the message is", msg.value)
              connection.send(
                JSON.stringify({
                  id: id,
                  value: msg,
                  channel: req.params.channel,
                  chat_id: req.params.chat,
                  user_id: req.user.id,
                })
              )
            }
          )
          produceMessage(Chats, msg, ws, req, null, null, id)
        }
      })
      // Handle WebSocket connection closure
      ws.on("close", async () => {
        // Remove the WebSocket connection from the chat room
        const chatKey = `${req.params.chat}_${req.params.channel}`
        Chats[chatKey] = Chats[chatKey].filter(
          (connection) => connection !== ws
        )
      })
    } catch (ex) {
      console.log("ERROR!!!", ex.message, ex)
      ws.close(4000, ex.message)
    }
  })
}
