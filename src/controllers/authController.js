const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { signToken } = require("../utils/token");
const { uploadImageToCloudinary } = require("../utils/uploadImage");

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  loginId: user.loginId,
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
  familyInformation: user.familyInformation,
});

const normalizeFamilyInformation = (list = []) =>
  Array.isArray(list)
    ? list.map((member) => ({
        ...member,
        forWithHoldingTax:
          member?.forWithHoldingTax === true ||
          member?.forWithHoldingTax === "true" ||
          member?.forWithHoldingTax === "on" ||
          member?.forWithHoldingTax === 1,
      }))
    : [];

const normalizeRollNumber = (value = "") => {
  const cleaned = String(value).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!cleaned) return "";
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
};

const registerAdmin = async (req, res) => {
  try {
    const { name, rollNumber, password } = req.body;
    const normalizedRoll = normalizeRollNumber(rollNumber);

    if (!name || !normalizedRoll || !password) {
      return res
        .status(400)
        .json({ message: "name, rollNumber and password are required" });
    }

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res
        .status(409)
        .json({ message: "Admin already exists. Only one admin is allowed." });
    }

    const adminRollNumberUsed = await Admin.findOne({ rollNumber: normalizedRoll });
    const studentRollNumberUsed = await User.findOne({ rollNumber: normalizedRoll });
    if (adminRollNumberUsed || studentRollNumberUsed) {
      return res.status(409).json({ message: "rollNumber already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      name,
      rollNumber: normalizedRoll,
      passwordHash,
      role: "admin",
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: admin._id,
        name: admin.name,
        rollNumber: admin.rollNumber,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { loginId, rollNumber, identifier, password } = req.body;
    const userIdentifier = normalizeRollNumber(identifier || loginId || rollNumber);

    if (!userIdentifier || !password) {
      return res
        .status(400)
        .json({ message: "identifier (loginId/rollNumber) and password are required" });
    }

    const admin = await Admin.findOne({ rollNumber: userIdentifier });
    const student = await User.findOne({
      $or: [{ loginId: userIdentifier }, { rollNumber: userIdentifier }],
    });
    const user = admin || student;
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const matched = await bcrypt.compare(password, user.passwordHash);
    if (!matched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    const dashboardRoute =
      user.role === "admin" ? "/admin/dashboard" : "/student/dashboard";

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userPayload(user),
      dashboardRoute,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDashboard = async (req, res) => {
  const common = userPayload(req.user);

  if (req.user.role === "admin") {
    const studentCount = await User.countDocuments({ role: "student" });
    return res.status(200).json({
      dashboardType: "admin",
      message: "Admin dashboard data",
      studentCount,
      user: common,
    });
  }

  return res.status(200).json({
    dashboardType: "student",
    message: "Student dashboard data",
    user: common,
  });
};

const updateProfile = async (req, res) => {
  try {
    const { profileImageBase64, profileImage } = req.body;
    const allowedFields = [
      "name",
      "section",
      "degree",
      "campus",
      "batch",
      "status",
      "gender",
      "email",
      "dob",
      "cnic",
      "mobileNo",
      "bloodGroup",
      "nationality",
      "permanentAddress",
      "currentAddress",
      "academicCalendar",
      "familyInformation",
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (field === "familyInformation") {
          req.user[field] = normalizeFamilyInformation(req.body[field]);
        } else {
          req.user[field] = req.body[field];
        }
      }
    }

    if (profileImageBase64) {
      req.user.profileImage = await uploadImageToCloudinary(
        profileImageBase64,
        "portal/students/profile"
      );
    }
    if (profileImage) {
      req.user.profileImage = profileImage;
    }

    await req.user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: userPayload(req.user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerAdmin, login, getDashboard, updateProfile };
