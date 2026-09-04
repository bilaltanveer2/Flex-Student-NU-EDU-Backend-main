const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Admin = require("../models/Admin");
const { uploadImageToCloudinary } = require("../utils/uploadImage");

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

const registerStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      password,
      section,
      degree,
      campus,
      batch,
      status,
      gender,
      email,
      dob,
      cnic,
      mobileNo,
      bloodGroup,
      nationality,
      permanentAddress,
      currentAddress,
      academicCalendar,
      familyInformation,
      profileImageBase64,
      profileImage,
    } = req.body;
    const normalizedRoll = normalizeRollNumber(rollNumber);

    if (!name || !normalizedRoll || !password) {
      return res.status(400).json({
        message: "name, rollNumber and password are required",
      });
    }

    const userExists = await User.findOne({ rollNumber: normalizedRoll });
    const adminExists = await Admin.findOne({ rollNumber: normalizedRoll });
    if (userExists || adminExists) {
      return res.status(409).json({ message: "rollNumber already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const uploadedProfileImage = profileImage
      ? profileImage
      : await uploadImageToCloudinary(profileImageBase64);

    const student = await User.create({
      name,
      rollNumber: normalizedRoll,
      passwordHash,
      role: "student",
      profileImage: uploadedProfileImage,
      section,
      degree,
      campus,
      batch,
      status,
      gender,
      email,
      dob,
      cnic,
      mobileNo,
      bloodGroup,
      nationality,
      permanentAddress,
      currentAddress,
      academicCalendar,
      familyInformation: normalizeFamilyInformation(familyInformation),
    });

    return res.status(201).json({
      message: "Student registered successfully",
      user: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        role: student.role,
        section: student.section,
        degree: student.degree,
        campus: student.campus,
        batch: student.batch,
        status: student.status,
        gender: student.gender,
        email: student.email,
        dob: student.dob,
        cnic: student.cnic,
        mobileNo: student.mobileNo,
        bloodGroup: student.bloodGroup,
        nationality: student.nationality,
        profileImage: student.profileImage,
        permanentAddress: student.permanentAddress,
        currentAddress: student.currentAddress,
        academicCalendar: student.academicCalendar,
        familyInformation: student.familyInformation,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Students list",
      count: students.length,
      students,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-passwordHash");
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.role !== "student")
      return res.status(404).json({ message: "Student not found" });

    return res.status(200).json({ message: "Student detail", student });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.role !== "student")
      return res.status(404).json({ message: "Student not found" });

    const {
      password,
      familyInformation,
      profileImage,
      profileImageBase64,
      ...rest
    } = req.body || {};
    if (Object.prototype.hasOwnProperty.call(rest, "rollNumber")) {
      rest.rollNumber = normalizeRollNumber(rest.rollNumber);
    }

    const allowedFields = [
      "name",
      "rollNumber",
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
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(rest, field)) {
        student[field] = rest[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "familyInformation")) {
      student.familyInformation = normalizeFamilyInformation(familyInformation);
    }

    if (profileImageBase64) {
      student.profileImage = await uploadImageToCloudinary(
        profileImageBase64,
        "portal/students/profile"
      );
    } else if (profileImage) {
      student.profileImage = profileImage;
    }

    if (password) {
      student.passwordHash = await bcrypt.hash(password, 10);
    }

    await student.save();

    const safeStudent = await User.findById(student._id).select("-passwordHash");
    return res.status(200).json({
      message: "Student updated successfully",
      student: safeStudent,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.role !== "student")
      return res.status(404).json({ message: "Student not found" });

    await User.deleteOne({ _id: student._id });
    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerStudent,
  listStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
