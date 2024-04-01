const router = require("express").Router();
const auth = require("../middlewares/auth");
const config = require("config");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploader = require("../utils/uploader");
const prisma = require("../utils/prisma");

import("livekit-server-sdk").then(({ AccessToken }) => {
  router.get("/messages", async (req, res) => {
    try {
      const channel = await prisma.channels.findFirst({
        where: {
          chat_id: parseInt(req.query.chat_id),
          name: req.query.channel,
        },
        include: {
          messages: {
            take: 10,
            skip: req.query.page * 10,
            orderBy: { createdAt: "desc" },
          },
        },
      });

      res.json(channel.Messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/:id", async (req, res) => {
    const chat = await prisma.chats.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        channels: {
          include: {
            messages: true,
          },
        },
        users: {
          include: {
            user : true
          }
        },
      },
    });

    res.send(chat);
  });

  router.post("/", [auth, upload.single("chat_pic")], async (req, res) => {
    try {
      const publicId = `${req.body.name}${uuidv4()}`;
      const url = await uploader(req.file, publicId);

      const chat = await prisma.chats.create({
        data: {
          type: req.body.type,
          name: req.body.name,
          inviteCode: uuidv4(),
          url: url.toString(),
          channels: {
            create: { name: "general", type: "text" },
          },
          users: {
            create: {
              user_id: req.user.id,
            },
          },
        },
        include: {
          channels: true,
          users: {
            include: {
              user: true,
            },
          },
        },
      });

      if (req.body.type === "personal") {
        await prisma.chatUser.create({
          data: {
            user: { connect: { id: req.body.recipient_id } },
            chat: { connect: { id: chat.id } },
          },
        });
      }

      res.json({
        chat,
        chat_user: chat.users[0],
        channel: chat.channels[0],
      });
    } catch (error) {
      res.send("something failed...");
      console.log(error.message, error);
    }
  });

  router.post("/join/:inviteCode", auth, async (req, res) => {
    const chat = await prisma.chats.findUnique({
      where: {
        inviteCode: req.params.inviteCode,
      },
    });

    if (!chat)
      return res
        .status(404)
        .send("server not found with the given invite code...");

    const already_joined = await prisma.chatUser.findUnique({
      where: {
        user_id: req.user.id,
        chat_id: chat.id,
      },
    });

    if (already_joined) {
      return res.status(400).send("already joined...");
    }

    const chat_user = await prisma.chatUser.create({
      data: {
        user_id: req.user.id,
        chat_id: chat.id,
      },
    });

    res.json(chat_user);
  });

  router.post("/createChannel", auth, async (req, res) => {
    const channel = await prisma.channels.create({
      data: {
        type: req.body.channel_type,
        name: req.body.name,
        chat_id: req.body.chat_id,
      },
    });

    res.json(channel);
  });

  router.post("/joinChannel/:channel", auth, async (req, res) => {
    const roomName = req.params.channel;
    const participantName = req.body.participantName;

    const at = new AccessToken(
      config.get("LIVEKIT_API_KEY"),
      config.get("LIVEKIT_API_SECRET"),
      {
        identity: participantName,
      }
    );

    at.addGrant({ roomJoin: true, room: roomName });

    const token = await at.toJwt();
    console.log(token);
    res.send(token);
  });

  router.put("/changeRole/:chatId/:userId", auth, async (req, res) => {
    if (req.body.role != "owner" || "moderator")
      return res.status(400).send("invalid role...");

    const owner = await prisma.chatUser.findFirst({
      where: {
        chat_id: req.params.chatId,
        user_id: req.user.id,
        role: "owner",
      },
    });

    if (!owner) return res.status(403).send("not authorized...");

    await prisma.chatUser.update({
      where: {
        userId_chatId: {
          userId: parseInt(req.params.userId),
          chatId: parseInt(req.params.chatId),
        },
      },
      data: {
        role: req.body.role,
      },
    });

    res
      .status(200)
      .send(`promoted user ${req.params.userId} to ${req.body.role}`);
  });

  router.put("/updateInviteCode/:chatId", auth, async (req, res) => {
    try {
      const newInviteCode = uuidv4();
      await prisma.chats.update({
        where: {
          id: parseInt(req.params.chatId),
        },
        data: {
          inviteCode: newInviteCode,
        },
      });

      res.json({ newInviteCode });
    } catch (error) {
      console.log(error.message, error);
    }
  });
});

module.exports = router;
