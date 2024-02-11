const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth.js")
const User = require("../models/user.js")

router.post("/:id", [auth], async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: "user not found..." })

    const blockedUser = await User.findByPk(req.params.id)

    if (!blockedUser) return res.status(404).send("user not found....")

    await User.update(
      {
        blockedUsers: [
          ...user.dataValues.blockedUsers,
          blockedUser.dataValues.id,
        ],
      },
      { where: { id: req.user.id } }
    )

    res.status(200).send("done!")
  } catch (error) {
    console.error("Error in block user endpoint:", error.message, error)
    res.status(500).send("Internal Server Error")
  }
})

router.put("/:id", [auth], async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ message: "user not found..." })

    const blockedUser = await User.findByPk(req.params.id)
    const new_blocked_list = user.dataValues.blockedUsers.filter((id) => {
      return id !== req.params.id
    })

    if (!blockedUser) return res.status(404).send("user not found....")

    await User.update(
      {
        blockedUsers: new_blocked_list,
      },
      { where: { id: req.user.id } }
    )

    res.status(200).send("done!")
  } catch (error) {
    console.error("Error in block user endpoint:", error.message, error)
    res.status(500).send("Internal Server Error")
  }
})

module.exports = router
