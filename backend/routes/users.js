const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth.js");
const blockedUsers = require("../middlewares/blockedUsers.js");
const prisma = require("../utils/prisma.js");
const moment = require("moment");

router.get("/", auth, async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(users);
  } catch (ex) {
    console.log(ex.message, ex);
    res.send("Someting failed.");
  }
});

router.get("/suggested", [auth, blockedUsers], async (req, res) => {
  const users = await prisma.users.findMany({
    where: {
      AND: [
        {
          id: {
            notIn: req.followedUsers, // Excluding followed users
          },
        },
        {
          id: {
            notIn: req.blockedUsers, // Excluding blocked users
          },
        },
      ],
    },
  });

  users.sort(() => Math.random() - 0.5);
  res.json(users);
});

router.get("/search", auth, async (req, res) => {
  const users = await prisma.users.findMany({
    where: {
      OR: [
        {
          name: {
            contains: req.query.user.toString(),
          },
        },
        {
          email: {
            contains: req.query.user.toString(),
          },
        },
      ],
    },
  });

  res.json(users);
});

router.get("/colleagues", auth, async (req, res) => {
  const me = await prisma.users.findUnique({ where: { id: req.user.id } });

  const users = await prisma.users.findMany({
    where: {
      department_id: me.department_id,
      id: {
        not: req.user.id,
      },
    },
  });

  res.json(users);
});

router.get("/stats/:id", async (req, res) => {
  try {
    // Average time taken to complete a ticket
    const { _avg } = await prisma.tickets.aggregate({
      _avg: {
        timeTakenToCompleteInHours: true,
      },
      where: {
        user_id: parseInt(req.params.id),
        closedOn: {
          not: null,
        },
        timeTakenToCompleteInHours: {
          not: null,
        },
      },
    });

    console.log(_avg.timeTakenToCompleteInHours);
    res.json(_avg.timeTakenToCompleteInHours);
  } catch (error) {
    console.error("Error in statistics endpoint:", error.message, error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/stats", async (req, res) => {
  try {
    const { _avg } = await prisma.tickets.aggregate({
      _avg: {
        timeTakenToCompleteInHours: true,
      },
      where: {
        closedOn: {
          not: null,
        },
        timeTakenToCompleteInHours: {
          not: null,
        },
      },
    });

    res.json(_avg.timeTakenToCompleteInHours);
  } catch (error) {
    console.error(error.message, error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const AllTimeRankedUsers = await prisma.users.findMany({
      orderBy: {
        points: "desc",
      },
      include: {
        tickets: true,
        department : true
      },
    });

    const currentDate = new Date();

    // Calculate the date one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    // Calculate the date one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

    // Fetch users along with their associated closed tickets in the last month
    const LastMonthRankedUsers = await prisma.users.findMany({
      include: {
        tickets: {
          where: {
            status: "closed",
            closedOn: {
              gt: oneMonthAgo,
            },
          },
        },
        department : true
      },
    });

    // Fetch users along with their associated closed tickets in the last year
    const LastYearRankedUsers = await prisma.users.findMany({
      include: {
        tickets: {
          where: {
            status: "closed",
            closedOn: {
              gt: oneYearAgo,
            },
          },
        },
        department : true
      },
    });

    // Sort users based on the count of closed tickets for last month
    LastMonthRankedUsers.sort((a, b) => b.Tickets.length - a.Tickets.length);

    // Sort users based on the count of closed tickets for last year
    LastYearRankedUsers.sort((a, b) => b.Tickets.length - a.Tickets.length);

    res.json({
      users1: AllTimeRankedUsers,
      users2: LastMonthRankedUsers,
      users3: LastYearRankedUsers,
    });
  } catch (ex) {
    console.log(ex.message,ex);
    res.status(500).send(ex.message);
  }
});

router.get("/:id", [auth], async (req, res) => {
  const user = await prisma.users.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
    include: {
      saveds: true,
      notifications: true,
      tickets: true,
      department: true,
      chats: {
        include: {
          chat: {
            include: {
              channels: true,
            },
          },
        },
      },
      following: {
        include: {
          following: true,
        },
      },
      followers: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!user) return res.status(404).send("user not found");

  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const p = await bcrypt.hash(req.body.password, salt);

    const user = await prisma.users.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: p,
        department_id: req.body.department_id,
      },
    });
    const token = jwt.sign({ id: user.id }, "karan112010");

    res.status(201).send({ token: token, User: user });
  } catch (ex) {
    console.log(ex, ex.message);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const authenticatedUser = await prisma.users.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!authenticatedUser) {
      return res.status(404).send("User Not Found.");
    }

    // Update the authenticated user's name
    await prisma.users.update({
      where: {
        id: req.user.id,
      },
      data: {
        name: req.body.name,
      },
    });

    res.status(200).send("updated!");
  } catch (ex) {
    console.log(ex);
    res.status(500).send("Internal Server Error");
  } finally {
    await prisma.$disconnect(); // Disconnect from the Prisma client
  }
});

router.delete("/:id", auth, async (req, res) => {
  const user = await prisma.users.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.status(200).send({ Deleted: user });
});

module.exports = router;
