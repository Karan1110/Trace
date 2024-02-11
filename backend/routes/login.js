const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

router.post("/login", async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  })

  if (!user) return res.status(200).send("No User found")

  const { password } = user
  const p = await bcrypt.compare(req.body.password, password)

  if (!p) return res.status(400).send("invalid credentials.")

  const token = jwt.sign(
    { id: id, isadmin: isadmin },
    config.get("jwtPrivateKey")
  )

  res.status(200).header("x-auth-token", token).send(user)
})

module.exports = router
