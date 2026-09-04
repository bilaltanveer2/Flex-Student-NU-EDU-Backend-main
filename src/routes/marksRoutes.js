const express = require("express");
const { protect, requireStudent } = require("../middleware/auth");
const { getStudentMarks } = require("../controllers/marksController");

const router = express.Router();

router.get("/", protect, requireStudent, getStudentMarks);

module.exports = router;
