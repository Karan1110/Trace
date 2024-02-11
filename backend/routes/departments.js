const express = require("express")
const router = express.Router()
const isadmin = require("../middlewares/isAdmin.js")
const auth = require("../middlewares/auth")
const Department = require("../models/department")
const Sequelize = require("sequelize")
// auth,
router.get("/", async (req, res) => {
  const departments = await Department.findAll()
  res.json(departments)
})

router.post("/", async (req, res) => {
  const department = await Department.create({
    name: req.body.name,
  })

  res.status(200).send(department)
})

router.put("/:id", [auth, isadmin], async (req, res) => {
  const department = await Department.update(
    {
      name: req.body.name,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )

  res.status(200).send(department)
})

router.delete("/:id", [auth, isadmin], async (req, res) => {
  await Department.destroy({
    where: {
      id: req.params.id,
    },
  })

  res.status(200).send("Deleted successfully")
})

module.exports = router
