const express = require("express");
const { protect, requireStudent } = require("../middleware/auth");
const { getStudentFeeDetails } = require("../controllers/feeDetailsController");

const router = express.Router();

router.get("/", protect, requireStudent, getStudentFeeDetails);

module.exports = router;

