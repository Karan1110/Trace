const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Department = require("../models/department");

router.get("/", auth, async (req, res) => {
  const departments = await Department.findAll();
  res.json(departments);
});

router.post("/", auth, async (req, res) => {
  const department = await Department.create({
    name: req.body.name,
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
