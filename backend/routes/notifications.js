const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth")
const isadmin = require("../middlewares/isAdmin.js")
const Notification = require("../models/notification")
// [auth,isadmin]
router.post("/", async (req, res) => {
  const notification = await Notification.create({
    message: req.body.message,
    user_id: req.body.user_id,
  })

  res.status(200).send(notification)
})

router.put("/:id", [auth, isadmin], async (req, res) => {
  const notification = await Notification.update(
    {
      message: req.body.message,
      user_id: req.body.user_id,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )

  res.status(200).send(notification)
})

router.delete("/:id", [auth, isadmin], async (req, res) => {
  const notification = await Notification.destroy({
    where: {
      id: req.params.id,
    },
  })

  res.status(200).send({ DELETED: notification })
})

module.exports = router
