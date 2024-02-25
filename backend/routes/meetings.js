const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const User = require("../models/user");
const Sequelize = require("sequelize");
const MeetingMember = require("../models/MeetingMember");
const Meeting = require("../models/meeting");
const winston = require("winston");
const moment = require("moment");
const Department = require("../models/department.js");

router.get("/", auth, async (req, res) => {
  const meetings = await Meeting.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Department,
        as: "MeetingDepartment",
      },
      {
        model: User,
        as: "Participants",
      },
    ],
  });
  res.json(meetings);
});

router.get("/departments/:id", async (req, res) => {
  const meetings = await Meeting.findAll({
    order: [["createdAt", "DESC"]],
    where: {
      department_id: req.params.id,
    },
    include: [
      {
        model: Department,
        as: "MeetingDepartment",
      },
      {
        model: User,
        as: "Participants",
      },
    ],
  });
  res.json(meetings);
});

router.post("/", [auth], async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(400).send("user not found");
    }

    const link = "http://localhost:5173/meet/" + req.body.link;
    const startingOn = moment(req.body.startingOn);
    const endingOn = moment(req.body.endingOn);
    const duration = endingOn.diff(startingOn, "hours");

    const meeting = await Meeting.create({
      name: req.body.name,
      link: link,
      description: req.body.description,
      duration: parseInt(duration),
      department_id: req.body.department_id,
      startingOn: startingOn,
      endingOn: endingOn,
    });

    for (invitee of req.body.invitees) {
      await MeetingMember.create({
        user_id: invitee,
        meeting_id: meeting.dataValues.id,
      });
    }

    await MeetingMember.create({
      user_id: req.user.id,
      meeting_id: meeting.dataValues.id,
    });

    res.status(200).send(meeting);
  } catch (error) {
    console.log("error creating a meeting...", error);
    res.status(500).send("Something failed.");
  }
});

router.post("/addToSchedule/:id", auth, async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);
    if (!meeting) return res.status(404).send("meeting not found...");
    const currentTime = moment.utc();
    if (moment(meeting.dataValues.endingOn).utc().isAfter(currentTime))
      return res.status(400).send("meeting has already ended...");

    const m_m = await MeetingMember.findOne({
      meeting_id: req.params.id,
      user_id: req.user.id,
    });

    if (m_m) return res.status(400).send("already added to your schedule...");

    const meeting_member = await MeetingMember.create({
      meeting_id: req.params.id,
      user_id: req.user.id,
    });

    await User.update(
      {
        total_meetings: Sequelize.literal(`total_meetings + 1`),
      },
      {
        where: {
          id: req.user.id,
        },
      }
    );

    res.json(meeting_member);
  } catch (ex) {
    console.error(ex.message, ex);
    res.status(500).send("something failed...");
  }
});

router.put("/", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found..." });
  }

  const meeting = await Meeting.findByPk(req.body.meeting_id);
  if (!meeting)
    return res.status(404).json({ message: "Meeting not found..." });

  const currentDate = moment.utc();
  if (
    moment(meeting.dataValues.startingOn).utc().isAfter(currentDate) ||
    moment(meeting.dataValues.endingOn).utc().isBefore(currentDate)
  )
    return res
      .status(400)
      .send("the meeting has already ended or not yet started...");

  let meeting_member = await MeetingMember.findOne({
    where: {
      meeting_id: meeting.dataValues.id,
      user_id: req.user.id,
    },
  });
  if (!meeting_member) {
    meeting_member = await MeetingMember.create({
      user_id: req.user.id,
      meeting_id: req.body.meeting_id,
    });
  }

  if (meeting_member.dataValues.attended == true) {
    return res
      .status(400)
      .send("meeting member not found or has already attended the meeting...");
  }

  await User.update(
    {
      attended_meetings: Sequelize.literal(`attended_meetings + 1`),
    },
    {
      where: {
        id: req.user.id,
      },
    }
  );

  await MeetingMember.update(
    {
      attended: true,
    },
    {
      where: {
        user_id: req.user.id,
        meeting_id: meeting.dataValues.id,
      },
    }
  );

  res.send("updated successfully...");
});
// not used in frontend...
router.put("/:id", [auth], async (req, res) => {
  try {
    const startDate = moment(req.body.startingOn);
    const endDate = moment(req.body.endingOn);
    const durationInHours = endDate.diff(startDate, "hours");

    const meeting = await Meeting.update(
      {
        name: req.body.name,
        link: req.body.link,
        description: req.body.description,
        duration: durationInHours,
      },
      {
        where: {
          id: req.body.mm_id,
        },
      }
    );

    res.status(200).send(meeting);
  } catch (ex) {
    winston.error(ex);
    res.status(500).send("Something failed.");
  }
});
// not used in frontend...
router.delete("/:id", [auth], async (req, res) => {
  try {
    await Meeting.destroy({
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
