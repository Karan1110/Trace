const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth")
const isadmin = require("../middlewares/isAdmin.js")
const User = require("../models/user")
const Sequelize = require("sequelize")
const MeetingMember = require("../models/MeetingMember")
const Meeting = require("../models/meeting")
const winston = require("winston")
const moment = require("moment")
const Department = require("../models/department.js")

router.get("/", auth, async (req, res) => {
  const meetings = await Meeting.findAll({
    order: [["createdAt", "DESC"]],
    include: {
      model: Department,
      as: "MeetingDepartment",
    },
  })
  res.json(meetings)
})

router.get("/departments/:id", auth, async (req, res) => {
  const meetings = await Meeting.findAll({
    order: [["createdAt", "DESC"]],
    where: {
      department_id: req.params.id,
    },
    include: {
      model: Department,
      as: "MeetingDepartment",
    },
  })
  res.json(meetings)
})

router.get("/users/:id", auth, async (req, res) => {
  const meetings = await MeetingMember.findAll({
    order: [["createdAt", "DESC"]],
    where: {
      user_id: req.params.id,
    },
    include: [
      {
        model: User,
        as: "MeetingMemberUser",
      },
      {
        model: Meeting,
        as: "MeetingMemberMeeting",
      },
    ],
  })

  res.json(meetings)
})

router.post("/", [auth], async (req, res) => {
  let meeting
  try {
    const { meeting_id } = req.body

    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(400).send("user not found")
    }

    const link = "http://localhost:42069/" + req.body.link

    if (!meeting_id) {
      meeting = await Meeting.create({
        name: req.body.name,
        link: link,
        description: req.body.description,
        duration: req.body.duration,
        department_id: req.body.department_id,
      })
    } else {
      meeting = await Meeting.findByPk(meeting_id)
      if (!meeting)
        return res.status(400).json({ message: "meeting not found..." })
    }

    const m_m = await MeetingMember.findOne({
      where: {
        user_id: req.user.id,
        meeting_id: meeting.dataValues.id,
      },
    })

    if (m_m)
      return res.status(400).json({ message: "already joined the meeting..." })

    await MeetingMember.create({
      user_id: req.user.id,
      meeting_id: meeting.dataValues.id || meeting.id,
    })

    await User.update(
      {
        total_meetings: Sequelize.literal(`total_meetings + 1`),
      },
      {
        where: {
          id: req.user.id,
        },
      }
    )

    res.status(200).send(meeting)
  } catch (error) {
    console.log("error creating a meeting...", error)
    res.status(500).send("Something failed.")
  }
})

router.put("/", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id)
  if (!user) {
    return res.status(404).json({ message: "User not found..." })
  }
  const meeting = await Meeting.findByPk(req.body.meeting_id)
  if (!meeting) return res.status(404).json({ message: "Meeting not found..." })

  if (user.attended_meetings) {
    if (user.attended_meetings === user.total_meetings) {
      return res.status(400).json({
        message: "Attended meetings can't be more than total meetings",
      })
    }
  }

  const currentTime = moment()
  const targetTime = moment(meeting.from)
  const isPast = currentTime.isAfter(targetTime)

  if (!isPast) {
    return res.status(400).json({
      message:
        "cannot update meeting attendance before the start of the meeting...",
    })
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
  )
  res.send("updated successfully...")
})

router.put("/:id", [auth, isadmin], async (req, res) => {
  try {
    const startDate = moment(req.body.from)
    const endDate = moment(req.body.to)
    const durationInHours = endDate.diff(startDate, "hours")

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
    )

    res.status(200).send(meeting)
  } catch (ex) {
    winston.error(ex)
    res.status(500).send("Something failed.")
  }
})

router.delete("/:id", [auth, isadmin], async (req, res) => {
  try {
    await Meeting.destroy({
      where: {
        id: req.params.id,
      },
    })

    res.status(200).send("Deleted successfully")
  } catch (ex) {
    winston.error(ex)
    res.status(500).send("something failed")
  }
})

module.exports = router
