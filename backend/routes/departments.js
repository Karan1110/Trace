const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const uploader = require("../utils/uploader");
const multer = require("multer");
const prisma = require("../utils/prisma");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", auth, async (req, res) => {
  const departments = await prisma.departments.findMany({});
  res.json(departments);
});

router.get("/:id", auth, async (req, res) => {
  const department = await prisma.departments.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      Users: true,
      Meetings: true,
      Tickets: true,
    },
  });

  const followingInCommon = await prisma.followUsers.findMany({
    where: {
      followedBy_id: req.user.id,
      following_id: {
        [Op.In]: department.Users.map((u) => u.id),
      },
    },
    include: {
      Users_FollowUsers_following_idToUsers: true,
    },
  });

  res.json({
    department,
    followingInCommon: followingInCommon.map((f) => {
      return {
        name: f.Users_FollowUsers_following_idToUsers.name,
        email: f.Users_FollowUsers_following_idToUsers.email,
      };
    }),
  });
});

router.post("/", [auth, upload.single("profile_pic")], async (req, res) => {
  let url;

  const publicId = `${req.body.name}${uuidv4()}`;
  if (req.file) {
    url = await uploader(req.file, publicId);
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
