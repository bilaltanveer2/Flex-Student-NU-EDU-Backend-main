const { uploadBufferToCloudinary } = require("../utils/uploadImage");

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "image file is required" });
    }

    const url = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "portal/students/profile",
      resource_type: "image",
    });

    return res.status(200).json({
      message: "Uploaded",
      url,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadProfileImage };
