const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Department = require("../models/department");
const uploader = require("../utils/uploader");
const User = require("../models/user");
const Meeting = require("../models/meeting");
const Ticket = require("../models/ticket");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", auth, async (req, res) => {
  const departments = await Department.findAll({ attributes: ["name"] });
  res.json(departments);
});

router.get("/:id", auth, async (req, res) => {
  const department = await Department.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "users",
      },
      {
        model: Meeting,
        as: "meetings",
      },
      {
        model: Ticket,
        as: "tickets",
      },
    ],
  });

  const followingInCommon = await FollowUser.findAll({
    where: {
      followedBy_id: req.user.id,
      following_id: {
        [Op.In]: department.dataValues.users.map((u) => u.id),
      },
    },
    include: [
      {
        model: User,
        as: "following",
      },
    ],
  });

  res.json({
    department,
    followingInCommon: followingInCommon.map((f) => {
      return { name: f.following.name, email: f.following.email };
    }),
  });
});

router.post("/", [auth, upload.single("profile_pic")], async (req, res) => {
  let url;
  if (req.file) {
    url = await uploader(req.file);
  }

  const department = await Department.create({
    name: req.body.name,
    url: url,
  });

  res.status(200).send(department);
});

router.put("/:id", [auth], async (req, res) => {
  const department = await Department.update(
    {
      name: req.body.name,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  );

  res.status(200).send(department);
});

router.delete("/:id", [auth], async (req, res) => {
  await Department.destroy({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).send("Deleted successfully");
});

module.exports = router;
