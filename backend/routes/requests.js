const express = require("express");
const router = express.Router();
const { Request } = require("../models"); // Assuming your Request model is exported from '../models'
const user = require("../middlewares/auth.js");

// Create a request
router.post("/", auth, async (req, res) => {
  try {
    const { senderId, recipientId } = req.body;
    const recipient = await User.findByPk(recipientId);

    if (recipient && recipient.dataValues.blockedUsers.includes(req.user.id))
      return res.send(
        "the user whom you are trying to send an invite request has blocked you!"
      );

    // Create the request
    const request = await Request.create({
      sender_id: senderId,
      recipient_id: recipientId,
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/:id/accept", async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    request.accepted = true;
    await request.save();
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete a request by ID
router.delete("/:id", async (req, res) => {
  try {
    const requestId = req.params.id;

    // Find the request by ID
    const request = await Request.findByPk(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Delete the request
    await request.destroy();

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
