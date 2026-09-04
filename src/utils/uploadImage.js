const cloudinary = require("../config/cloudinary");

const uploadImageToCloudinary = async (base64Image, folder = "portal/students") => {
  if (!base64Image) return null;

  const result = await cloudinary.uploader.upload(base64Image, {
    folder,
    resource_type: "image",
  });

  return result.secure_url;
};

const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result?.secure_url);
    });

    stream.end(buffer);
  });

module.exports = { uploadImageToCloudinary, uploadBufferToCloudinary };
