const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const winston = require("winston");
const moment = require("moment");
const prisma = require("../utils/prisma.js");

router.get("/", auth, async (req, res) => {
  const meetings = await prisma.meetings.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      department: true,
      users: true,
    },
  });
  res.json(meetings);
});

router.get("/departments/:id", async (req, res) => {
  const meetings = await prisma.meetings.findMany({
    orderBy: {
      createdAt: true,
    },
    where: {
      department_id: req.params.id,
    },
    include: {
      department: true,
      users: true,
    },
  });
  res.json(meetings);
});

router.post("/", [auth], async (req, res) => {
  try {
    const user = await prisma.users.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(400).send("user not found");
    }

    const link = "http://localhost:5173/meet/" + req.body.link;
    const startingOn = moment(req.body.startingOn);
    const endingOn = moment(req.body.endingOn);
    const duration = endingOn.diff(startingOn, "hours");

    const meeting = await prisma.meetings.create({
      data: {
        name: req.body.name,
        link: link,
        description: req.body.description,
        duration: parseInt(duration),
        department_id: req.body.department_id,
        startingOn: startingOn,
        endingOn: endingOn,
        users: {
          create: {
            user_id: req.user.id,
          },
        },
      },
    });

    if (req.body.invitees.length > 0) {
      for (invitee of req.body.invitees) {
        await prisma.meetingMember.create({
          data: {
            user_id: invitee,
            meeting_id: meeting.id,
          },
        });

        await prisma.notifications.create({
          data: {
            user_id: invitee,
            message: `new meeting assigned just now!  - ${user.name}`,
          },
        });
      }

      await axios.post(
        "/notifications",
        {
          user_id: invitee,
          message: `a new meeting ! - ${meeting.name}`,
        },
        {}
      );
    }

    res.status(200).send(meeting);
  } catch (error) {
    console.log("error creating a meeting...", error);
    res.status(500).send("Something failed.");
  }
});

router.post("/addToSchedule/:id", auth, async (req, res) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!meeting) return res.status(404).send("meeting not found...");

    const currentTime = moment.utc();
    if (moment(meeting.endingOn).utc().isAfter(currentTime))
      return res.status(400).send("meeting has already ended...");

    const m_m = await prisma.meetingMember.findFirst({
      where: {
        meeting_id: req.params.id,
        user_id: req.user.id,
      },
    });

    if (m_m) return res.status(400).send("already added to your schedule...");

    const meeting_member = await prisma.meetingMember.create({
      data: {
        meeting_id: req.params.id,
        user_id: req.user.id,
      },
    });

    await prisma.users.update({
      where: {
        id: req.user.id,
      },
      data: {
        total_meetings: {
          increment: 1,
        },
      },
    });

    res.json(meeting_member);
  } catch (ex) {
    console.error(ex.message, ex);
    res.status(500).send("something failed...");
  }
});

router.put("/", auth, async (req, res) => {
  const user = await prisma.users.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "User not found..." });

  const meeting = await prisma.meetings.findUnique({
    where: { id: req.body.meeting_id },
  });
  if (!meeting)
    return res.status(404).json({ message: "Meeting not found..." });

  const currentDate = moment.utc();
  if (
    moment(meeting.startingOn).utc().isAfter(currentDate) ||
    moment(meeting.endingOn).utc().isBefore(currentDate)
  )
    return res
      .status(400)
      .send("the meeting has already ended or not yet started...");

  let meeting_member = await prisma.meetingMember.findUnique({
    where: {
      meeting_id: meeting.id,
      user_id: req.user.id,
    },
  });

  if (!meeting_member) {
    meeting_member = await prisma.meetingMember.create({
      data: {
        user_id: req.user.id,
        meeting_id: req.body.meeting_id,
      },
    });
  }

  if (meeting_member.attended == true) {
    return res
      .status(400)
      .send("meeting member not found or has already attended the meeting...");
  }

  await prisma.users.update({
    where: {
      id: req.user.id,
    },
    data: {
      attended_meetings: {
        increment: 1,
      },
    },
  });

  await prisma.meetingMember.update({
    where: {
      user_id: req.user.id,
      meeting_id: meeting.id,
    },
    data: {
      attended: true,
    },
  });

  res.send("updated successfully...");
});
// not used in frontend...
router.put("/:id", [auth], async (req, res) => {
  try {
    const startDate = moment(req.body.startingOn);
    const endDate = moment(req.body.endingOn);
    const durationInHours = endDate.diff(startDate, "hours");

    const meeting = await prisma.meetings.update({
      data: {
        name: req.body.name,
        link: req.body.link,
        description: req.body.description,
        duration: durationInHours,
      },
      where: {
        id: req.body.mm_id,
      },
    });

    res.status(200).send(meeting);
  } catch (ex) {
    winston.error(ex);
    res.status(500).send("Something failed.");
  }
});
// not used in frontend...
router.delete("/:id", [auth], async (req, res) => {
  try {
    await prisma.meetings.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).send("Deleted successfully");
  } catch (ex) {
    winston.error(ex);
    res.status(500).send("something failed");
  }
});

module.exports = router;
