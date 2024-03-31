const config = require("config");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: config.get("cloudinary_cloud_name"),
  api_key: config.get("cloudinary_api_key"),
  api_secret: config.get("cloudinary_api_secret"),
});

module.exports = async (file, public_id, file_type) => {
  try {
    const b64 = Buffer.from(file.buffer).toString("base64");
    let dataURI = "data:" + file.mimetype + ";base64," + b64;

    const { secure_url } = await cloudinary.uploader.upload(dataURI, {
      public_id: public_id,
      resource_type: file_type || "image",
    });

    return secure_url;
  } catch (error) {
    console.error(error.message, error);
  }
};
