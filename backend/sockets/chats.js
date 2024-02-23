const Message = require("../models/message")
const User = require("../models/user")
const Chat = require("../models/chat")
const ChatUser = require("../models/ChatUser")
const auth = require("./utils/auth")
const { produceMessage } = require("./utils/Kafka")
const { startConsumingMessages } = require("./utils/Kafka")
const { v4: uuidv4 } = require("uuid")
const Channel = require("../models/channel")

module.exports = function (app) {
  require("express-ws")(app)
  // TODO  - use db for this

  // Store WebSocket connections for each chat room
  const Chats = {}

  app.ws("/chat/:chat/:channel", auth, async (ws, req) => {
    try {
      let currentChat = await Chat.findByPk(req.params.chat, {
        include: [
          {
            as: "channels",
            model: Channel,
            include: {
              model: Message,
              as: "messages",
              include: {
                model: User,
                as: "Sender",
              },
            },
          },
        ],
      })

      const user = await User.findByPk(req.user.id)

      if (!currentChat || !user) {
        ws.close("chat not found")
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
      const channelIndex = currentChat.dataValues.channels.findIndex(
        (c) => c.name == req.params.channel
      )
      req.channel = currentChat.dataValues.channels[channelIndex]
      const messages = currentChat.dataValues.channels[channelIndex].messages

      // Send all messages to the WebSocket connection and mark them as read
      if (messages && messages.length > 0) {
        for (const msg of messages) {
          ws.send(
            JSON.stringify({
              id: msg.id,
              value: msg.value,
              user_id: msg.user_id,
              isRead: true, // Mark as read
              channel: msg.channel_id,
              url: msg.url,
            })
          )
        }
      }

      startConsumingMessages(req.channel)

      // Handle incoming messages
      ws.on("message", async (msg) => {
        const regex = /edit-message-karan112010/
        const regex2 = /send-image-karan112010/

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
          produceMessage(Chats, msg, ws, req, true, message_id, null, null)
        } else if (regex2.test(msg)) {
          const id = uuidv4().toString()
          const temp = msg.split("=")
          const url = temp[temp.length - 1]
          Chats[`${req.params.chat}_${req.params.channel}`].forEach(
            (connection) => {
              console.log("the value of the message is", msg.value)
              connection.send(
                JSON.stringify({
                  id: id,
                  value: null,
                  channel_id: req.channel.id,
                  chat_id: req.params.chat,
                  user_id: req.user.id,
                  url: url,
                })
              )
            }
          )

          produceMessage(Chats, msg, ws, req, null, null, id, url)
        } else {
          const id = uuidv4().toString()
          Chats[`${req.params.chat}_${req.params.channel}`].forEach(
            (connection) => {
              console.log("the value of the message is", msg.value)
              connection.send(
                JSON.stringify({
                  id: id,
                  value: msg,
                  channel_id: req.channel.id,
                  chat_id: req.params.chat,
                  user_id: req.user.id,
                })
              )
            }
          )
          produceMessage(Chats, msg, ws, req, null, null, id, null)
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

// direct messaging;

/* 
const Message = require("../models/message");
const User = require("../models/user");
const Chat = require("../models/chat");
const ChatUser = require("../models/ChatUser");
const auth = require("./utils/auth");

const { produceMessage } = require("./utils/Kafka");
const { startConsumingMessages } = require("./utils/Kafka");
const { v4: uuidv4 } = require("uuid");

module.exports = function (app) {
  require("express-ws")(app);

  // Store WebSocket connections for each user
  const Users = {};

  app.ws("/chat/:userId", auth, async (ws, req) => {
    try {
      const recipientId = req.params.userId;
      const senderId = req.user.id;

      // Ensure both sender and recipient exist
      const [sender, recipient] = await Promise.all([
        User.findByPk(senderId),
        User.findByPk(recipientId),
      ]);

      if (!sender || !recipient) {
        ws.close("User not found");
        return;
      }

      // Check if the WebSocket connection for the sender exists
      if (!Users[senderId]) {
        Users[senderId] = [];
      }

      // Add the WebSocket connection to the sender's connections
      Users[senderId].push(ws);

      // Handle incoming messages
      ws.on("message", async (msg) => {
        const id = uuidv4().toString();

        // Send the message to the recipient's WebSocket connections
        if (Users[recipientId]) {
          Users[recipientId].forEach((connection) => {
            connection.send(
              JSON.stringify({
                id: id,
                value: msg,
                sender_id: senderId,
                recipient_id: recipientId,
              })
            );
          });
        } else {
          // If the recipient is not online, handle the message accordingly
          // For example, you could store the message in a database and mark it as unread
        }
      });

      // Handle WebSocket connection closure
      ws.on("close", async () => {
        // Remove the WebSocket connection from the sender's connections
        Users[senderId] = Users[senderId].filter(
          (connection) => connection !== ws
        );
      });
    } catch (ex) {
      console.error("ERROR:", ex.message);
      ws.close(4000, ex.message);
    }
  });
};






*/
