const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth")
const Comment = require("../models/comment.js")

router.post("/", auth, async (req, res) => {
  const comment = await Comment.create({
    content: req.body.content,
    user_id: req.user.id,
    ticket_id: req.body.ticket_id,
  })

  res.status(200).json(comment)
})

router.put("/:id", [auth], async (req, res) => {
  const comment = await Comment.update(
    {
      content: req.body.content,
      user_id: req.body.user_id,
      ticket_id: req.body.ticket_id,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )

  res.status(200).json(comment)
})

router.delete("/:id", [auth], async (req, res) => {
  await Comment.destroy({
    where: {
      id: req.params.id,
    },
  })

  res.status(200).send("deleted!")
})

module.exports = router
