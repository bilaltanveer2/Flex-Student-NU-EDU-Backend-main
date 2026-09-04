const Marks = require("../models/Marks");
const User = require("../models/User");

const buildCourseSummary = (course) => ({
  code: course.code,
  title: course.title,
});

const normalizeRow = (r) => ({
  rowLabel: r?.rowLabel != null ? String(r.rowLabel).trim() : "",
  weightage: r?.weightage != null ? Number(r.weightage) : 0,
  obtainedMarks: r?.obtainedMarks != null ? Number(r.obtainedMarks) : 0,
  totalMarks: r?.totalMarks != null ? Number(r.totalMarks) : 0,
  average: r?.average != null ? Number(r.average) : 0,
  stdDev: r?.stdDev === "" || r?.stdDev === null || r?.stdDev === undefined ? null : Number(r.stdDev),
  min: r?.min != null ? Number(r.min) : 0,
  max: r?.max != null ? Number(r.max) : 0,
  isTotalRow: !!r?.isTotalRow,
});

const normalizeSection = (s) => ({
  key: String(s?.key || "").trim(),
  label: s?.label != null ? String(s.label).trim() : "",
  rows: Array.isArray(s?.rows) ? s.rows.map(normalizeRow) : [],
});

const normalizeCourses = (courses = []) => {
  if (!Array.isArray(courses)) return [];
  return courses
    .filter((c) => c && c.code)
    .map((c) => ({
      code: String(c.code).trim(),
      title: c.title ? String(c.title).trim() : "",
      sections: Array.isArray(c.sections) ? c.sections.map(normalizeSection).filter((x) => x.key) : [],
    }));
};

const getStudentMarks = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { term, courseCode } = req.query;

    const docs = await Marks.find({ student: studentId }).sort({ updatedAt: -1 });
    const terms = docs.map((d) => d.term);
    const selectedTerm = term || terms[0] || "";

    const doc = selectedTerm ? docs.find((d) => d.term === selectedTerm) : null;
    const courses = doc?.courses || [];
    const summaries = courses.map(buildCourseSummary);

    const selectedCourse =
      (courseCode ? courses.find((c) => c.code === courseCode) : courses[0]) || null;

    return res.status(200).json({
      message: "Marks",
      terms,
      selectedTerm,
      courses: summaries,
      selectedCourse: selectedCourse
        ? {
            code: selectedCourse.code,
            title: selectedCourse.title,
            sections: selectedCourse.sections || [],
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId).select("-passwordHash");
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const { term, courseCode } = req.query;
    const docs = await Marks.find({ student: studentId }).sort({ updatedAt: -1 });
    const terms = docs.map((d) => d.term);
    const selectedTerm = term || terms[0] || "";

    const doc = selectedTerm ? docs.find((d) => d.term === selectedTerm) : null;
    const courses = doc?.courses || [];
    const summaries = courses.map(buildCourseSummary);
    const selectedCourse =
      (courseCode ? courses.find((c) => c.code === courseCode) : courses[0]) || null;

    return res.status(200).json({
      message: "Marks",
      student,
      terms,
      selectedTerm,
      courses: summaries,
      coursesFull: courses,
      selectedCourse: selectedCourse
        ? {
            code: selectedCourse.code,
            title: selectedCourse.title,
            sections: selectedCourse.sections || [],
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertAdminStudentMarks = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const { term, courses } = req.body || {};
    if (!term) return res.status(400).json({ message: "term is required" });

    const normalizedCourses = normalizeCourses(courses);

    const doc = await Marks.findOneAndUpdate(
      { student: studentId, term: String(term).trim() },
      { $set: { courses: normalizedCourses } },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Marks saved",
      marks: doc,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAdminStudentMarksTerm = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const term = String(req.query.term || "").trim();
    if (!term) return res.status(400).json({ message: "term is required" });

    await Marks.deleteOne({ student: studentId, term });
    return res.status(200).json({ message: "Marks term deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentMarks,
  getAdminStudentMarks,
  upsertAdminStudentMarks,
  deleteAdminStudentMarksTerm,
};
