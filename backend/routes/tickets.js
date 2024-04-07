const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.js");
const moment = require("moment");
const multer = require("multer");
const blockedUsers = require("../middlewares/blockedUsers.js");
const uploader = require("../utils/uploader.js");
const prisma = require("../utils/prisma.js");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { v4: uuidv4 } = require("uuid");

// count
router.get("/", async (req, res) => {
  try {
    const tickets = [];

    const open = await prisma.tickets.count({
      where: {
        status: "open",
      },
    });

    const closed = await prisma.tickets.count({
      where: {
        status: "closed",
      },
    });

    const inProgress = await prisma.tickets.count({
      where: {
        status: "in_progress",
      },
    });

    tickets.push(open);
    tickets.push(closed);
    tickets.push(inProgress);

    res.send(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all", [auth, blockedUsers], async (req, res) => {
  try {
    let whereClause = {};

    if (req.blockedUsers && req.blockedUsers.length > 0) {
      whereClause = {
        user_id: {
          notIn: req.blockedUsers,
        },
      };
    }

    const tickets = await prisma.tickets.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });

    res.json(tickets);
  } catch (ex) {
    console.error(ex.message, ex);
    res.send("Something failed.");
  }
});

router.get("/latest", [auth, blockedUsers], async (req, res) => {
  try {
    let tickets;
    if (req.blockedUsers.length > 0) {
      tickets = await prisma.tickets.findMany({
        where: {
          user_id: {
            notIn: req.blockedUsers,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          user: {
            include: {
              department: true,
            },
          },
          department: true,
        },
      });
    } else {
      tickets = await prisma.tickets.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          user: {
            include: {
              department: true,
            },
          },
          department: true,
        },
      });
    }

    res.json(tickets);
  } catch (ex) {
    console.error(ex.message, ex);
    res.send("Something failed.");
  }
});

router.get("/closed", [auth, blockedUsers], async (req, res) => {
  try {
    const whereClauseBase = {
      status: "closed",
    };

    if (req.blockedUsers && req.blockedUsers.length > 0) {
      whereClauseBase.user_id = {
        notIn: req.blockedUsers,
      };
    }

    const whereClause =
      req.query.department_id === "all" || !req.query.department_id
        ? whereClauseBase
        : {
            ...whereClauseBase,
            department_id: req.query.department_id,
          };

    const incompleteTickets = await prisma.tickets.findMany({
      where: whereClause,
      orderBy: {
        [req.query.sortingProperty]:
          req.query.sortingProperty == "createdAt" ? "desc" : "asc",
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });

    res.json(incompleteTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// filter open tickets
router.get("/open", [auth, blockedUsers], async (req, res) => {
  try {
    const whereClause = {
      status: "open",
    };

    if (req.blockedUsers && req.blockedUsers.length > 0) {
      whereClause.user_id = {
        notIn: req.blockedUsers,
      };
    }

    if (req.query.department_id && req.query.department_id !== "all") {
      whereClause.department_id = req.query.department_id;
    }

    const openTickets = await prisma.tickets.findMany({
      where: whereClause,
      orderBy: {
        [req.query.sortingProperty]:
          req.query.sortingProperty == "createdAt" ? "desc" : "asc",
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });
    res.json(openTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// filter in_progress tickets
router.get("/in_progress", [auth, blockedUsers], async (req, res) => {
  try {
    const whereClause = {
      status: "in_progress",
    };

    if (req.blockedUsers && req.blockedUsers.length > 0) {
      whereClause.user_id = {
        notIn: req.blockedUsers,
      };
    }

    if (req.query.department_id && req.query.department_id !== "all") {
      whereClause.department_id = req.query.department_id;
    }

    const tickets = await prisma.tickets.findMany({
      where: whereClause,
      orderBy: {
        [req.query.sortingProperty]:
          req.query.sortingProperty == "createdAt" ? "desc" : "asc",
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/pending", auth, async (req, res) => {
  try {
    const tickets = await prisma.tickets.findMany({
      where: {
        AND: {
          user_id: req.user.id,
          OR: [
            {
              status: "open",
            },
            {
              status: "in_progress",
            },
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { ticket } = req.query;

    if (!ticket) {
      return res
        .status(400)
        .json({ error: "Ticket name is required in the request body." });
    }

    const matchingTickets = await prisma.tickets.findMany({
      where: {
        OR: [
          { name: { contains: ticket.toString() } },
          { description: { contains: ticket.toString() } },
        ],
      },
    });

    res.json(matchingTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/feed", [auth, blockedUsers], async (req, res) => {
  const temp = [...req.blockedUsers, req.user.id];

  const tickets = await prisma.tickets.findMany({
    where: {
      user_id: {
        notIn: temp,
      },
    },
    include: {
      user: {
        include: {
          department: true,
        },
      },
      department: true,
    },
  });

  tickets.sort(() => Math.random() - 0.5);
  res.status(200).json(tickets);
});

router.get("/departments", auth, async (req, res) => {
  const user = await prisma.users.findUnique({ where: { id: req.user.id } });
  const department_id = user.department_id;

  const tickets = await prisma.tickets.findMany({
    where: {
      department_id: department_id,
    },
    include: {
      user: {
        include: {
          department: true,
        },
      },
      department: true,
    },
  });

  res.json(tickets);
});

router.get("/followingFeed", auth, async (req, res) => {
  const user = await prisma.users.findUnique({
    where: {
      id: req.user.id,
    },
  });

  const followedUsers = user.followedUsers;

  if (followedUsers) {
    const tickets = await prisma.tickets.findMany({
      where: {
        user_id: {
          in: followedUsers,
        },
      },
      include: {
        user: {
          include: {
            department: true,
          },
        },
        department: true,
      },
    });

    return res.json(tickets);
  } else {
    return res.status(400).send([]);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ticket = await prisma.tickets.findUniqueOrThrow({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        user: {
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
        },
        comments: {
          include: {
            user: true,
          },
        },
        beforeTicket: {
          include: {
            user: true,
          },
        },
        afterTickets: true,
        saveds: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(ticket);
  } catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post(
  "/",
  [
    auth,
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "image", maxCount: 1 },
    ]),
  ],
  async (req, res) => {
    let imageUrl, videoUrl;

    const user = await prisma.users.findFirst({
      where: { id: parseInt(req.body.user_id) },
    });
    if (!user) return res.status(400).send("User not found");

    const start_date = moment(req.body.deadline);
    const now = moment();

    // Check if the deadline is more than two days later
    if (start_date.diff(now, "days") < 1) {
      return res
        .status(400)
        .send(
          `Deadline should be at least two days later - ${start_date.diff(
            now,
            "days"
          )}`
        );
    }

    console.log(req.files.video[0].fieldname);

    if (req.files.image && req.files.video) {
      console.log("uploading.....");
      const VideoPublicId = `${req.body.name}_video_${uuidv4()}`;
      const ImagePublicId = `${req.body.name}_image_${uuidv4()}`;
      const _videoUrl = await uploader(
        req.files.video[0],
        VideoPublicId,
        "video"
      );
      const _imageUrl = await uploader(req.files.image[0], ImagePublicId);
      imageUrl = _imageUrl;
      videoUrl = _videoUrl;
    }

    const id = await prisma.tickets.count();

    const ticket = await prisma.tickets.create({
      data: {
        name: `${req.body.name} #${id + 1}`,
        user_id: parseInt(req.body.user_id),
        deadline: start_date.toDate(),
        status: req.body.status,
        description: req.body.description,
        department_id: parseInt(req.body.department_id),
        before_id: parseInt(req.body.before_id),
        videoUrl: videoUrl,
        imageUrl: imageUrl,
        meeting_link: `${req.body.name}@${uuidv4()}`,
      },
      include: {
        user: true,
      },
    });

    await prisma.notifications.create({
      data: {
        message: `a new ticket for you! - ${ticket.name}`,
        user_id: parseInt(req.body.user_id),
      },
    });

    res.status(200).send(ticket);
  }
);

router.post("/save/:id", auth, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        saveds: true,
      },
    });

    if (
      user.saveds.some((saved) => saved.ticket.id === parseInt(req.params.id))
    ) {
      return res.status(400).send("Already saved...");
    }

    await prisma.saveds.create({
      data: {
        ticket_id: parseInt(req.params.id),
        user_id: req.user.id,
      },
    });

    res.send("saved!");
  } catch (ex) {
    console.log("ERROR : ", ex.message);
    console.log(ex);
    res.send("something failed...");
  }
});

router.post("/save/remove/:id", auth, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        saveds: {
          include: {
            ticket: true,
          },
        },
      },
    });

    if (user.saveds.some((saved) => saved.ticket.id !== req.body.ticket_id)) {
      return res.status(400).send("not saved...");
    }

    await prisma.saveds.delete({
      where: {
        ticket_id: parseInt(req.params.id),
        user_id: req.user.id,
      },
    });

    res.send("removed!");
  } catch (ex) {
    console.log("ERROR : ", ex.message);
    console.log(ex);
    res.send("something failed...");
  }
});

// not used in frontend...
router.put("/changeStatus/:id", [auth], async (req, res) => {
  const ticket = await prisma.tickets.findUniqueOrThrow({
    where: { id: parseInt(req.params.id) },
  });
  if (!ticket) return res.status(404).json({ message: "ticket not found..." });

  await prisma.tickets.update({
    data: {
      status: req.body.status,
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (req.user.id !== ticket.user_id) {
    await prisma.notifications.create({
      data: {
        user_id: ticket.user_id,
        message: `the status of your ticket has been changed! - ${ticket.name}`,
      },
    });
  }

  res.status(200).json({ message: "done!" });
});

router.put("/close/:id", [auth], async (req, res) => {
  const ticket = await prisma.tickets.findUniqueOrThrow({
    where: { id: parseInt(req.params.id) },
  });
  if (!ticket) return res.status(404).json({ message: "ticket not found..." });

  const startingDate = moment(ticket.createdAt);
  const now = moment();

  let timeTakenToCompleteInHours = parseInt(
    startingDate.diff(now, "hours")
  );

  if (timeTakenToCompleteInHours === 0) {
    const temp = parseInt(startingDate.diff(now, "minutes"));
    timeTakenToCompleteInHours = (temp / 60);
}

  await prisma.tickets.update({
    data: {
      status: "closed",
      closedOn: now,
      timeTakenToCompleteInHours,
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  const points = ticket.deadline > now ? 1 : 2;

  await prisma.users.update({
    where: { id: req.user.id },
    data: {
      points: {
        increment: points,


      },
    },
  });

  await prisma.notifications.create({
    data: {
      user_id: ticket.user_id,
      message: `your ticket has been closed! - ${ticket.name}`,
    },
  });

  res.status(200).json({ message: "done!" });
});

router.put("/assign/:id", [auth], async (req, res) => {
  const ticket = await prisma.tickets.findUniqueOrThrow({
    where: { id: parseInt(req.params.id) },
  });

  const user = await prisma.users.findUniqueOrThrow({
    where: { id: req.body.user_id },
  });

  await prisma.tickets.update({
    data: {
      user_id: user.id,
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  await prisma.notifications.create({
    data: {
      user_id: user.id,
      message: `you have been assigned a existing tickt - ${ticket.name}`,
    },
  });

  res.status(200).json({ message: "done!" });
});

router.put("/:id", [auth], async (req, res) => {
  const ticket = await prisma.tickets.findUniqueOrThrow({
    where: { id: parseInt(req.params.id) },
  });

  const deadline = moment(req.body.deadline);

  await prisma.tickets.update({
    data: {
      name: req.body.name,
      deadline: deadline.toDate(),
      description: req.body.description,
    },
    where: {
      id: parseInt(req.params.id),
    },
  });

  await prisma.notifications.create({
    data: {
      user_id: ticket.user_id,
      message: `your ticket has been updated! - ${ticket.name}`,
    },
  });
  res.status(200).send(ticket);
});

router.delete("/:id", [auth], async (req, res) => {
  await prisma.tickets.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });

  res.status(200).send("Deleted successfully");
});

module.exports = router;
