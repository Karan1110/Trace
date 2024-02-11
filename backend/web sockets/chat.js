const Message = require("../models/message")
const User = require("../models/user")
const Sequelize = require("sequelize")
const Chat = require("../models/chat")
const auth = require("./utils/auth")
const addToChats = require("./utils/addToChats")
const addToChannels = require("./utils/addToChannels")
const sendMessage = require("./utils/sendMessage")

module.exports = function (app) {
  require("express-ws")(app)
  // TODO  - use db for this
  // Store WebSocket connections for each chat room
  const Chats = {}

  app.ws("/chat/:chatRoom/:channel", auth, async (ws, req) => {
    try {
      console.log("user connected...")
      const user_id = req.query.user_id
      let chatRoom = await Chat.findByPk(req.params.chatRoom)
      const user = await User.findByPk(req.user.id)
      if (!chatRoom) {
        chatRoom = await Chat.create({
          id: req.params.chatRoom,
          user_id: [req.query.user_id],
          channels: [req.params.channel],
          type: req.query.type,
          name: req.query.name,
        })
      }
      // console.log(chatRoom.dataValues)
      if (
        !chatRoom.dataValues.user_id.includes(
          user.dataValues.id || user.id || req.query.user_id
        )
      ) {
        addToChats(
          Chat,
          user.id || user.dataValues.id,
          chatRoom.id || chatRoom.dataValues.id
        )
      }

      if (
        !chatRoom.dataValues.channels.includes(req.params.channel || "general")
      ) {
        addToChannels(Chat, req.params.channel, chatRoom.id)
      }

      if (!user_id) {
        return ws.close(4000, "Missing user_id")
      }

      // Check if the chat room exists, create a new one if it doesn't
      const chatRoomKey = `${req.params.chatRoom}_${req.params.channel}`
      if (!Chats[chatRoomKey]) {
        Chats[chatRoomKey] = []
      }

      // Add the WebSocket connection to the chat room
      Chats[chatRoomKey].push(ws)

      // Update user's online status
      if (!user.dataValues.chats.includes(req.params.chatRoom)) {
        await User.update(
          {
            isOnline: true,
            chats: Sequelize.fn(
              "array_append",
              Sequelize.col("chats"),
              chatRoom.dataValues.id.toString() || chatRoom.id.toString()
            ),
          },
          {
            where: {
              id: req.query.user_id || req.user.id,
            },
          }
        )
      } else {
        await User.update(
          {
            isOnline: true,
          },
          {
            where: {
              id: req.query.user_id || req.user.id,
            },
          }
        )
      }

      await Message.update(
        { isRead: true },
        {
          where: {
            isRead: false,
            chatRoom_id: chatRoom.id || chatRoom.dataValues.id,
            user_id: {
              [Sequelize.Op.notIn]: [req.user.id, req.query.user_id],
            },
          },
        }
      )

      // Get all messages for the current chat room
      const messages = await Message.findAll({
        where: {
          chatRoom_id:
            chatRoom.id || chatRoom.dataValues.id || req.params.chatRoom,
          channel: req.params.channel || "general",
        },
        limit: 20,
        order: [["createdAt", "ASC"]],
      })

      // Mark all messages as read

      // Send all messages to the WebSocket connection and mark them as read
      for (const msg of messages) {
        ws.send(
          JSON.stringify({
            id: msg.id,
            message: msg.message,
            user_id: msg.user_id,
            isRead: true, // Mark as read
            channel: msg.channel,
          })
        )
      }

      // Handle incoming messages
      ws.on("message", async (msg) => {
        sendMessage(
          Chats,
          msg,
          req.params.channel,
          Message,
          req.params.chatRoom,
          req,
          ws
        )
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
              id: req.query.user_id || user.dataValues.id || user.id,
            },
          }
        )

        // Remove the WebSocket connection from the chat room
        const chatRoomKey = `${req.params.chatRoom}_${req.params.channel}`
        Chats[chatRoomKey] = Chats[chatRoomKey].filter(
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
