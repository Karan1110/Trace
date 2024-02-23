const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Notification = require("../models/notification");

router.post("/", async (req, res) => {
  const notification = await Notification.create({
    message: req.body.message,
    user_id: req.body.user_id,
  });

  res.status(200).send(notification);
});

module.exports = router;
