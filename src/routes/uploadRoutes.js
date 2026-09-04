const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/auth");
const { uploadProfileImage } = require("../controllers/uploadController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/profile-image", protect, upload.single("image"), uploadProfileImage);

module.exports = router;
