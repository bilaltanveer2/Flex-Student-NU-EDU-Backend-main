const Attendance = require("../models/Attendance");
const User = require("../models/User");

const computePercentage = (lectures = []) => {
  const total = lectures.length;
  if (!total) return 0;
  const present = lectures.filter((l) => l.presence === "P").length;
  return Math.round((present / total) * 10000) / 100;
};

const buildCourseSummary = (course) => ({
  code: course.code,
  title: course.title,
  attendancePercentage: computePercentage(course.lectures),
});

const normalizeCourses = (courses = []) => {
  if (!Array.isArray(courses)) return [];

  return courses
    .filter((c) => c && c.code)
    .map((c) => ({
      code: String(c.code).trim(),
      title: c.title ? String(c.title).trim() : "",
      lectures: Array.isArray(c.lectures)
        ? c.lectures.map((l, idx) => ({
            lectureNo:
              typeof l?.lectureNo === "number"
                ? l.lectureNo
                : idx + 1,
            date: l?.date
              ? String(l.date).trim()
              : l?.lectureDate
              ? String(l.lectureDate).trim()
              : "",
            durationHours:
              typeof l?.durationHours === "number"
                ? l.durationHours
                : l?.durationHours != null
                ? Number(l.durationHours)
                : l?.duration != null
                ? Number(l.duration)
                : l?.hours != null
                ? Number(l.hours)
                : undefined,
            presence: l?.presence === "A" ? "A" : "P",
          }))
        : [],
    }));
};

const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { term, courseCode } = req.query;

    const docs = await Attendance.find({ student: studentId }).sort({
      updatedAt: -1,
    });
    const terms = docs.map((d) => d.term);
    const selectedTerm = term || terms[0] || "";

    const doc = selectedTerm
      ? docs.find((d) => d.term === selectedTerm)
      : null;

    const courses = doc?.courses || [];
    const summaries = courses.map(buildCourseSummary);

    const selectedCourse =
      (courseCode
        ? courses.find((c) => c.code === courseCode)
        : courses[0]) || null;

    return res.status(200).json({
      message: "Attendance",
      terms,
      selectedTerm,
      courses: summaries,
      selectedCourse: selectedCourse
        ? {
            code: selectedCourse.code,
            title: selectedCourse.title,
            attendancePercentage: computePercentage(selectedCourse.lectures),
            lectures: selectedCourse.lectures || [],
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId).select("-passwordHash");
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const { term, courseCode } = req.query;
    const docs = await Attendance.find({ student: studentId }).sort({
      updatedAt: -1,
    });
    const terms = docs.map((d) => d.term);
    const selectedTerm = term || terms[0] || "";
    const doc = selectedTerm
      ? docs.find((d) => d.term === selectedTerm)
      : null;

    const courses = doc?.courses || [];
    const summaries = courses.map(buildCourseSummary);
    const selectedCourse =
      (courseCode
        ? courses.find((c) => c.code === courseCode)
        : courses[0]) || null;

    return res.status(200).json({
      message: "Attendance",
      student,
      terms,
      selectedTerm,
      courses: summaries,
      coursesFull: courses,
      selectedCourse: selectedCourse
        ? {
            code: selectedCourse.code,
            title: selectedCourse.title,
            attendancePercentage: computePercentage(selectedCourse.lectures),
            lectures: selectedCourse.lectures || [],
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertAdminStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const { term, courses } = req.body || {};
    if (!term) return res.status(400).json({ message: "term is required" });

    const normalizedCourses = normalizeCourses(courses);

    const doc = await Attendance.findOneAndUpdate(
      { student: studentId, term: String(term).trim() },
      { $set: { courses: normalizedCourses } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Attendance saved",
      attendance: doc,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAdminStudentAttendanceTerm = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const term = String(req.query.term || "").trim();
    if (!term) return res.status(400).json({ message: "term is required" });

    await Attendance.deleteOne({ student: studentId, term });
    return res.status(200).json({ message: "Attendance term deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentAttendance,
  getAdminStudentAttendance,
  upsertAdminStudentAttendance,
  deleteAdminStudentAttendanceTerm,
};

