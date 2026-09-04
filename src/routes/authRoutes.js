const express = require("express");
const {
  registerAdmin,
  login,
  getDashboard,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/login", login);
router.get("/dashboard", protect, getDashboard);
router.patch("/profile", protect, updateProfile);

module.exports = router;
