const express = require("express");
const { protect, requireStudent } = require("../middleware/auth");
const { getStudentAttendance } = require("../controllers/attendanceController");

const router = express.Router();

router.get("/", protect, requireStudent, getStudentAttendance);

module.exports = router;

