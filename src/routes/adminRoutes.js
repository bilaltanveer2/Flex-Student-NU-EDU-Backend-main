const express = require("express");
const {
  registerStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/adminController");
const {
  getAdminStudentAttendance,
  upsertAdminStudentAttendance,
  deleteAdminStudentAttendanceTerm,
} = require("../controllers/attendanceController");
const {
  getAdminStudentMarks,
  upsertAdminStudentMarks,
  deleteAdminStudentMarksTerm,
} = require("../controllers/marksController");
const {
  getAdminStudentTranscript,
  upsertAdminStudentTranscript,
} = require("../controllers/transcriptController");
const {
  getAdminStudentFeeChallan,
  upsertAdminStudentFeeChallan,
} = require("../controllers/feeChallanController");
const {
  getAdminStudentFeeDetails,
  upsertAdminStudentFeeDetails,
} = require("../controllers/feeDetailsController");
const { getAdminDashboard } = require("../controllers/dashboardController");
const { protect, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/register-student", protect, requireAdmin, registerStudent);
router.get("/dashboard", protect, requireAdmin, getAdminDashboard);
router.get("/students", protect, requireAdmin, listStudents);
router.get("/students/:id", protect, requireAdmin, getStudentById);
router.patch("/students/:id", protect, requireAdmin, updateStudent);
router.delete("/students/:id", protect, requireAdmin, deleteStudent);
router.get("/students/:id/attendance", protect, requireAdmin, getAdminStudentAttendance);
router.put("/students/:id/attendance", protect, requireAdmin, upsertAdminStudentAttendance);
router.delete("/students/:id/attendance", protect, requireAdmin, deleteAdminStudentAttendanceTerm);
router.get("/students/:id/marks", protect, requireAdmin, getAdminStudentMarks);
router.put("/students/:id/marks", protect, requireAdmin, upsertAdminStudentMarks);
router.delete("/students/:id/marks", protect, requireAdmin, deleteAdminStudentMarksTerm);
router.get("/students/:id/transcript", protect, requireAdmin, getAdminStudentTranscript);
router.put("/students/:id/transcript", protect, requireAdmin, upsertAdminStudentTranscript);
router.get("/students/:id/fee-challan", protect, requireAdmin, getAdminStudentFeeChallan);
router.put("/students/:id/fee-challan", protect, requireAdmin, upsertAdminStudentFeeChallan);
router.get("/students/:id/fee-details", protect, requireAdmin, getAdminStudentFeeDetails);
router.put("/students/:id/fee-details", protect, requireAdmin, upsertAdminStudentFeeDetails);

module.exports = router;
