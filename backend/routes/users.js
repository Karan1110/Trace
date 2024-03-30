const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth.js");
const blockedUsers = require("../middlewares/blockedUsers.js")
const prisma = require("../utils/prisma.js");

router.get("/", auth, async (req, res) => {
  try {
    const users = await prisma.users.findMany();
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
  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          name: {
            contains: req.query.user, // Assuming req.query.user is the search term
          },
        },
        {
          email: {
            contains: req.query.user, // Assuming req.query.user is the search term
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
      NOT: {
        id: req.user.id,
      },
    },
  });

  res.json(users);
});

router.get("/stats/:id", async (req, res) => {
  try {
    // Average time taken to complete a ticket
    const averageTimeTakenToCompleteTicket = await prisma.tickets.aggregate({
      _avg: {
        updatedAt: {
          _subtract: "createdAt",
        },
      },
      where: {
        userId: parseInt(req.params.id),
      },
    });

    console.log(averageTimeTakenToCompleteTicket);
    res.status(200).send(averageTimeTakenToCompleteTicket);
  } catch (error) {
    console.error("Error in statistics endpoint:", error.message, error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/stats", async (req, res) => {
  try {
    const averageTimeTakenToCompleteTicket = await prisma.tickets.aggregate({
      _avg: {
        updatedAt: {
          _subtract: "createdAt",
        },
      },
    });
    console.log(verageTimeTakenToCompleteTicket);
    res.status(200).send(averageTimeTakenToCompleteTicket);
  } catch (error) {
    console.error("Error in statistics endpoint:", error.message, error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const AllTimeRankedUsers = await prisma.users.findMany({
      orderBy: {
        points: "desc",
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
        Tickets: {
          where: {
            status: "closed",
            closedOn: {
              gt: oneMonthAgo,
            },
          },
        },
      },
    });

    // Fetch users along with their associated closed tickets in the last year
    const LastYearRankedUsers = await prisma.users.findMany({
      include: {
        Tickets: {
          where: {
            status: "closed",
            closedOn: {
              gt: oneYearAgo,
            },
          },
        },
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
    res.status(500).send(ex.message);
    console.log("ERROR : ");
    console.log(ex);
  }
});

router.get("/:id", [auth], async (req, res) => {
  const user = await prisma.users.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      Saveds: true,
      Notifications: true,
      Tickets: true,
      MeetingMembers: {
        include: {
          User: true,
          Meeting: true,
        },
      },
      Departments: true,
      ChatUsers: {
        include: {
          chat: {
            include: {
              Channels: true,
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
          followedBy: true,
        },
      },
    },
  });
  if (!user) return res.status(404).send("user not found");

  // const following = await FollowUser.findAll({
  //   where: {
  //     followedBy_id: req.params.id,
  //   },
  //   include: {
  //     model: User,
  //     as: "following",
  //     attributes: ["name", "email"],
  //   },
  // });
  // user.following = following;

  // const followedBy = await FollowUser.findAll({
  //   where: {
  //     following_id: req.params.id,
  //   },
  //   include: {
  //     model: User,
  //     as: "followedBy",
  //     attributes: ["name", "email"],
  //   },
  // });
  // user.followedBy = followedBy;

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
      id: req.params.id,
    },
  });

  res.status(200).send({ Deleted: user });
});

module.exports = router;
