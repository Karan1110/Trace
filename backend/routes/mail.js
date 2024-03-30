"use strict";
const LimMailer = require("lim-mailer");
const otpGenerator = require("otp-generator");
const router = require("express").Router();

router.post("/", async (req, res) => {
  const c = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
    digits: true,
  });

  console.log(c);

  // pass in the mailbox configuration when creating the instance:
  const mailer = new LimMailer(
    {
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: "gowdakaran939@gmail.com",
        pass: "spywobbvhtbkswyi",
      },
      alias: "Veera",
    },
    {
      to: [`${req.body.to}`],
      cc: [],
    }
  );

  mailer
    .sendMail({
      subject: "OTP verification - Trace", // Subject line
      html: `Welcome to Trace!...
      <br/>
      <b>Your otp to sign in to <i> Trace </i> is ${c}</b>`, // HTML body
    })
    .then((info) => {
      console.log(info);
    })
    .catch((ex) => {
      console.log(ex);
    });

  res.status(200).json({ mail_code: c });
});

module.exports = router;
