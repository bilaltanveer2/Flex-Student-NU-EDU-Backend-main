const express = require("express");
const { protect, requireStudent } = require("../middleware/auth");
const {
  getStudentFeeChallan,
  getStudentFeeChallanById,
  getStudentFeeChallanPdf,
} = require("../controllers/feeChallanController");

const router = express.Router();

router.get("/", protect, requireStudent, getStudentFeeChallan);
router.get("/:challanId/pdf", protect, requireStudent, getStudentFeeChallanPdf);
router.get("/:challanId", protect, requireStudent, getStudentFeeChallanById);

module.exports = router;

