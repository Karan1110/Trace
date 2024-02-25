const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dd7slpjud",
  api_key: "538459367684964",
  api_secret: "51oKGM47I-8nI5vAARdKrGoLUUI",
});

module.exports = (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = "data:" + file.mimetype + ";base64," + b64;

  const { secure_url } = cloudinary.uploader.upload(
    dataURI,
    { upload_preset: "my_preset" },
    (error, result) => {
      console.log(result, error);
    }
  );

  return secure_url;
};
