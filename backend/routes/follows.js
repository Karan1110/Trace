const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.js");
const prisma = require("../utils/prisma.js");

router.post("/:id", [auth], async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: req.user.id,
      },
    });

    if (!user) return res.status(404).json({ message: "user not found..." });

    const followedUser = await prisma.users.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (!followedUser) return res.status(404).send("user not found....");

    await prisma.followUsers.create({
      data: {
        user_id: req.user.id,
        following_id: followedUser.id,
      },
    });

    await prisma.users.update({
      where: {
        id: req.user.id,
      },
      data: {
        followedUsers: {
          push: parseInt(followedUser.id),
        },
      },
    });

    await prisma.notifications.create({
      data: {
        user_id: followedUser.id,
        message: `${user.name} just followed you!`,
      },
    });

    res.status(200).send("done!");
  } catch (error) {
    console.error("Error in follow user endpoint:", error.message, error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/:id", [auth], async (req, res) => {
  try {
    const user = await prisma.users.findUniqueOrThrow({
      where: {
        id: req.user.id,
      },
    });

    if (!user) return res.status(404).json({ message: "user not found..." });

    const followedUser = await prisma.users.findUniqueOrThrow({
      where: { id: parseInt(req.params.id) },
    });

    const new_followed_list = user.followedUsers.filter((id) => {
      return id !== parseInt(req.params.id);
    });

    await FollowUser.destroy({
      where: {
        following_id: parseInt(req.params.id),
        user_id: req.user.id,
      },
    });
    if (!followedUser) return res.status(404).send("user not found....");

    await prisma.users.update({
      where: {
        id: req.user.id,
      },
      data: {
        followedUsers: { set: new_followed_list },
      },
    });

    res.status(200).send("done!");
  } catch (error) {
    console.error("Error in follow user endpoint:", error.message, error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
