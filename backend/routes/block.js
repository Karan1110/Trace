const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.js");
const prisma = require("../utils/prisma.js");

router.post("/:id", auth, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: { blockedUsers: true },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    const blockedUser = await prisma.users.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!blockedUser)
      return res.status(404).json({ message: "Blocked user not found." });

    await prisma.users.update({
      where: { id: req.user.id },
      data: { blockedUsers: { push: parseInt(req.params.id) } },
    });

    res.status(200).send("User blocked successfully!");
  } catch (error) {
    console.error("Error in blocking user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      include: { blockedUsers: true },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    const newBlockedUsers = user.blockedUsers.filter(
      (id) => id !== parseInt(req.params.id)
    );

    await prisma.users.update({
      where: { id: req.user.id },
      data: { blockedUsers: { set: newBlockedUsers } },
    });

    res.status(200).send("User unblocked successfully!");
  } catch (error) {
    console.error("Error in unblocking user:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
