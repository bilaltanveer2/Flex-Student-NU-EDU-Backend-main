const express = require("express");
const { protect, requireStudent } = require("../middleware/auth");
const { getStudentTranscript } = require("../controllers/transcriptController");

const router = express.Router();

router.get("/", protect, requireStudent, getStudentTranscript);

module.exports = router;

