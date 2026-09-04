const express = require("express");
const { getStudentDashboard } = require("../controllers/dashboardController");
const { protect, requireStudent } = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard", protect, requireStudent, getStudentDashboard);

module.exports = router;
