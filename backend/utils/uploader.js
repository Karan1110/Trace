const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dd7slpjud",
  api_key: "538459367684964",
  api_secret: "51oKGM47I-8nI5vAARdKrGoLUUI",
});

module.exports = async (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = "data:" + file.mimetype + ";base64," + b64;

  const { secure_url } = await cloudinary.uploader.upload(dataURI, {
    upload_preset: "my_preset",
  });

  return secure_url;
};
