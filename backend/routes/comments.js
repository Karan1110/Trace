const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const prisma = require("../utils/prisma.js");

router.post("/", auth, async (req, res) => {
  const ticket = await prisma.tickets.findUnique({
    where: {
      id: req.body.ticket_id,
    },
    select: {
      name: true,
    },
  });

  if (!ticket) return res.status(404).send("ticket not found...");

  await axios.post(
    "/notifications",
    {
      user_id: ticket.user_id,
      message: `a new comment has been posted! - ${ticket.name}`,
    },
    {}
  );

  const comment = await prisma.comments.create({
    data: {
      content: req.body.content,
      user_id: req.user.id,
      ticket_id: req.body.ticket_id,
    },
  });

  res.status(200).json(comment);
});

router.put("/:id", [auth], async (req, res) => {
  const comment = await prisma.comments.update({
    where: {
      id: req.params.id,
    },
    data: {
      content: req.body.content,
      user: { connect: { id: req.body.user_id } },
      ticket: { connect: { id: req.body.ticket_id } },
    },
  });

  res.status(200).json(comment);
});

router.delete("/:id", [auth], async (req, res) => {
  await prisma.comments.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).send("deleted!");
});

module.exports = router;
