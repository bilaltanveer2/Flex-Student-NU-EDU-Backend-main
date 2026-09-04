const User = require("../models/User");

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  rollNumber: user.rollNumber,
  role: user.role,
  section: user.section,
  degree: user.degree,
  campus: user.campus,
  batch: user.batch,
  status: user.status,
  gender: user.gender,
  email: user.email,
  dob: user.dob,
  cnic: user.cnic,
  mobileNo: user.mobileNo,
  bloodGroup: user.bloodGroup,
  nationality: user.nationality,
  profileImage: user.profileImage,
  permanentAddress: user.permanentAddress,
  currentAddress: user.currentAddress,
  academicCalendar: user.academicCalendar,
  familyInformation: user.familyInformation || [],
});

const getAdminDashboard = async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: "student" });

    return res.status(200).json({
      dashboardType: "admin",
      message: "Admin dashboard data",
      stats: { studentCount },
      user: buildUserPayload(req.user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudentDashboard = async (req, res) => {
  return res.status(200).json({
    dashboardType: "student",
    message: "Student dashboard data",
    user: buildUserPayload(req.user),
  });
};

module.exports = { getAdminDashboard, getStudentDashboard };
