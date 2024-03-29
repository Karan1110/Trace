const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth.js");
const blockedUsers = require("../middlewares/blockedUsers.js");
const Chat = require("../models/chat.js");
const User = require("../models/user.js");
const Ticket = require("../models/ticket.js");
const Meeting = require("../models/meeting.js");
const Notification = require("../models/notification.js");
const Department = require("../models/department.js");
const { Sequelize, Op } = require("sequelize");
const Saved = require("../models/saved.js");
const FollowUser = require("../models/followUser");
const Channel = require("../models/channel.js");
const Request = require("../models/request.js");

router.get("/", auth, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (ex) {
    console.log("ERROR : ");
    console.log(ex);
    res.send("Someting failed.");
  }
});

router.get("/suggested", [auth, blockedUsers], async (req, res) => {
  const users = await User.findAll({
    where: {
      id: {
        [Op.notIn]: req.blockedUsers,
      },
    },
  });

  users.sort(() => Math.random() - 0.5);
  res.json(users);
});

router.get("/search", auth, async (req, res) => {
  const users = await User.findAll({
    where: {
      [Op.or]: [
        {
          name: {
            [Op.iLike]: `%${req.query.user}%`,
          },
        },
        {
          email: {
            [Op.iLike]: `%${req.query.user}%`,
          },
        },
      ],
    },
  });
  res.json(users);
});

router.get("/colleagues", auth, async (req, res) => {
  const me = await User.findByPk(req.user.id);

  const users = await User.findAll({
    where: {
      department_id: me.department_id || me.dataValues.department_id,
      [Op.not]: {
        id: [req.user.id],
      },
    },
  });

  res.json(users);
});

router.get("/stats/:id", async (req, res) => {
  try {
    // Average time taken to complete a ticket
    const average_time_taken_to_complete_a_ticket = await Ticket.findAll({
      attributes: [
        [
          Sequelize.literal('AVG("Ticket"."updatedAt" - "Ticket"."createdAt")'),
          "average_time_taken",
        ],
      ],
      where: {
        user_id: req.params.id,
      },
    });
    console.log(average_time_taken_to_complete_a_ticket);
    res.status(200).send(average_time_taken_to_complete_a_ticket);
  } catch (error) {
    console.error("Error in statistics endpoint:", error.message, error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/stats", async (req, res) => {
  try {
    // Average time taken to complete a ticket
    const average_time_taken_to_complete_a_ticket = await Ticket.findAll({
      attributes: [
        [
          Sequelize.literal('AVG("Ticket"."updatedAt" - "Ticket"."createdAt")'),
          "average_time_taken",
        ],
      ],
    });
    console.log(average_time_taken_to_complete_a_ticket);
    res.status(200).send(average_time_taken_to_complete_a_ticket);
  } catch (error) {
    console.error("Error in statistics endpoint:", error.message, error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const AllTimeRankedUsers = await User.findAll({
      sort: [["points", "DESC"]],
    });

    const currentDate = new Date();

    // Calculate the date one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    // Calculate the date one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

    // Fetch users along with their associated closed tickets in the last month
    const LastMonthRankedUsers = await User.findAll({
      include: {
        model: Ticket,
        as: "Ticket",
        where: {
          status: "closed",
          closedOn: {
            [Op.between]: [oneMonthAgo, currentDate],
          },
        },
        required: false, // This will ensure that users without closed tickets in the last month are also included
      },
    });

    // Fetch users along with their associated closed tickets in the last year
    const LastYearRankedUsers = await User.findAll({
      include: {
        model: Ticket,
        as: "Ticket",
        where: {
          status: "closed",
          closedOn: {
            [Op.between]: [oneYearAgo, currentDate],
          },
        },
        required: false, // This will ensure that users without closed tickets in the last year are also included
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
  const user = await User.findOne({
    where: {
      id: req.params.id,
    },
    include: [
      {
        as: "mySavedTickets",
        model: Saved,
        include: [
          {
            as: "savedTicket",
            model: Ticket,
          },
        ],
      },
      {
        model: Notification,
        as: "Notification",
      },
      {
        model: Ticket,
        as: "Ticket",
      },

      {
        model: Meeting,
        as: "Meeting",
        include: {
          model: User,
          as: "Participants",
        },
      },
      {
        model: Department,
        as: "Department",
      },
      {
        model: Chat,
        as: "Chats",
        include: {
          model: Channel,
          as: "channels",
        },
      },
      {
        model: Request,
        as: "requests",
        include: {
          model: User,
          as: "sender",
        },
      },
      {
        model: Request,
        as: "friends",
        include: {
          model: User,
          as: "sender",
        },
      },
      {
        model: Request,
        as: "my_requests",
        include: {
          model: User,
          as: "recipient",
        },
      },
      {
        model: Request,
        as: "friends2",
        include: {
          model: User,
          as: "recipient",
        },
      },
    ],
  });
  if (!user) return res.status(404).send("user not found");

  const following = await FollowUser.findAll({
    where: {
      followedBy_id: req.params.id,
    },
    include: {
      model: User,
      as: "following",
      attributes: ["name", "email"],
    },
  });
  user.following = following;

  const followedBy = await FollowUser.findAll({
    where: {
      following_id: req.params.id,
    },
    include: {
      model: User,
      as: "followedBy",
      attributes: ["name", "email"],
    },
  });
  user.followedBy = followedBy;

  res.status(200).send({ user, followedBy, following });
});

router.post("/", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const p = await bcrypt.hash(req.body.password, salt);

    let user = new User({
      name: req.body.name,
      email: req.body.email,
      password: p,
      department_id: req.body.department_id,
    });
    user = await user.save();

    const token = user.generateAuthToken();

    res.status(201).send({ token: token, User: user });
  } catch (ex) {
    console.log(ex, ex.message);
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const authenticatedUser = await User.findByPk(req.user.id);

    if (!authenticatedUser) {
      return res.status(404).send("User Not Found.");
    }

    await authenticatedUser.update({
      name: req.body.name,
    });

    res.status(200).send("updated!");
  } catch (ex) {
    console.log(ex);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", auth, async (req, res) => {
  const user = await User.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).send({ Deleted: user });
});

module.exports = router;
