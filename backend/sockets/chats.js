const auth = require("./services/auth");
const { produceMessage } = require("./services/Kafka");
const { startConsumingMessages } = require("./services/Kafka");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../utils/prisma");

module.exports = function (app) {
  require("express-ws")(app);
  // TODO  - use db for this

  // Store WebSocket connections for each chat room
  const Chats = {};

  app.ws("/chat/:chat/:channel", auth, async (ws, req) => {
    try {
      let currentChat = await prisma.chats.findUniqueOrThrow({
        where: {
          id: req.params.chat,
        },
        include: {
          channels: {
            include: {
              messages: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      const user = await prisma.users.findUniqueOrThrow({
        where: {
          id: req.user.id,
        },
      });

      // Check if the chat room exists, create a new one if it doesn't
      const chatKey = `${req.params.chat}_${req.params.channel}`;
      if (!Chats[chatKey]) {
        Chats[chatKey] = [];
      }

      ws.username = user.name;

      // Add the WebSocket connection to the chat room
      Chats[chatKey].push(ws);

      const channelIndex = currentChat.channels.findIndex(
        (c) => c.name == req.params.channel
      );

      req.channel = currentChat.channels[channelIndex];
      const messages = currentChat.channels[channelIndex].messages;

      // Send all messages to the WebSocket connection and mark them as read
      if (messages && messages.length > 0) {
        for (const msg of messages) {
          ws.send(
            JSON.stringify({
              id: msg.id,
              value: msg.value,
              user_id: msg.user_id,
              channel: msg.channel_id,
              url: msg.url,
            })
          );
        }
      }

      startConsumingMessages(req.channel);

      // Handle incoming messages
      ws.on("message", async (msg) => {
        const regex = /edit-message-karan112010/;
        const regex2 = /send-image-karan112010/;
        const regex3 = /delete-message-karan112010/;

        if (regex.test(msg)) {
          const temp = msg.split("=");
          const message_id = temp[temp.length - 1];
          const temp2 = msg.split("~");
          const value = temp2[0];
          Chats[`${req.params.chat}_${req.params.channel}`].forEach(
            (connection) => {
              connection.send(
                JSON.stringify({
                  id: message_id,
                  value: value,
                  edited: true,
                })
              );
            }
          );
          produceMessage(msg, req, true, message_id, null, null);
        } else if (regex2.test(msg)) {
          const id = uuidv4().toString();
          const temp = msg.split("=");
          const url = temp[temp.length - 1];
          Chats[`${req.params.chat}_${req.params.channel}`].forEach(
            (connection) => {
              console.log("the value of the message is", msg.value);
              connection.send(
                JSON.stringify({
                  id: id,
                  value: null,
                  channel_id: req.channel.id,
                  chat_id: req.params.chat,
                  user_id: req.user.id,
                  url: url,
                })
              );
            }
          );

          produceMessage(Chats, msg, ws, req, null, null, id, url);
        } else if (regex3.test(msg)) {
          const temp = msg.split("=");
          const message_id = temp[temp.length - 1];
          Chats[`${req.params.chat}_${req.params.channel}`].forEach(
            (connection) => {
              connection.send(
                JSON.stringify({
                  id: message_id,
                  deleted: true,
                })
              );
            }
          );

          produceMessage(msg, req, false, message_id, null, null);
        } else {
          const id = uuidv4().toString();
          Chats[`${req.params.chat}_${req.params.channel}`].forEach(
            (connection) => {
              console.log("the value of the message is", msg.value);
              connection.send(
                JSON.stringify({
                  id: id,
                  value: msg,
                  channel_id: req.channel.id,
                  chat_id: req.params.chat,
                  user_id: req.user.id,
                })
              );
            }
          );
          produceMessage(Chats, msg, ws, req, null, null, id, null);
        }
      });
      // Handle WebSocket connection closure
      ws.on("close", async () => {
        // Remove the WebSocket connection from the chat room
        const chatKey = `${req.params.chat}_${req.params.channel}`;
        Chats[chatKey] = Chats[chatKey].filter(
          (connection) => connection !== ws
        );
      });
    } catch (ex) {
      console.log(ex.message, ex);
      ws.close(4000, ex.message);
    }
  });
};
