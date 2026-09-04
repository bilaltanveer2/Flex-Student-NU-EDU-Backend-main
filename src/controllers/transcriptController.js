const Transcript = require("../models/Transcript");
const User = require("../models/User");

const toNum = (v, fallback = 0) => {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeRow = (r) => ({
  code: r?.code != null ? String(r.code).trim() : "",
  courseName: r?.courseName != null ? String(r.courseName).trim() : "",
  section: r?.section != null ? String(r.section).trim() : "",
  crHrs: toNum(r?.crHrs, 0),
  grade: r?.grade != null ? String(r.grade).trim() : "",
  points: toNum(r?.points, 0),
  type: r?.type != null ? String(r.type).trim() : "",
  remarks: r?.remarks != null ? String(r.remarks).trim() : "",
  isHighlighted: !!r?.isHighlighted,
  linkDetails: {
    gradingScheme:
      r?.linkDetails?.gradingScheme != null
        ? String(r.linkDetails.gradingScheme).trim()
        : "",
    modifiedClassAverage:
      r?.linkDetails?.modifiedClassAverage === null ||
      r?.linkDetails?.modifiedClassAverage === undefined ||
      r?.linkDetails?.modifiedClassAverage === ""
        ? null
        : toNum(r.linkDetails.modifiedClassAverage, 0),
  },
});

const normalizeTerm = (t) => ({
  term: t?.term != null ? String(t.term).trim() : "",
  summary: {
    crAtt: toNum(t?.summary?.crAtt, 0),
    crEarned: toNum(t?.summary?.crEarned, 0),
    cgpa: toNum(t?.summary?.cgpa, 0),
    sgpa: toNum(t?.summary?.sgpa, 0),
  },
  rows: Array.isArray(t?.rows) ? t.rows.map(normalizeRow).filter((x) => x.code || x.courseName) : [],
});

const normalizeTerms = (terms) => {
  if (!Array.isArray(terms)) return [];
  return terms.map(normalizeTerm).filter((t) => t.term);
};

const getStudentTranscript = async (req, res) => {
  try {
    const studentId = req.user._id;
    const doc = await Transcript.findOne({ student: studentId });
    return res.status(200).json({
      message: "Transcript",
      transcript: doc
        ? {
            arn: doc.arn || "",
            batch: doc.batch || "",
            terms: Array.isArray(doc.terms) ? doc.terms : [],
            updatedAt: doc.updatedAt,
          }
        : { arn: "", batch: "", terms: [], updatedAt: null },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminStudentTranscript = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId).select("-passwordHash");
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const doc = await Transcript.findOne({ student: studentId });
    return res.status(200).json({
      message: "Transcript",
      student,
      transcript: doc
        ? {
            arn: doc.arn || "",
            batch: doc.batch || "",
            terms: Array.isArray(doc.terms) ? doc.terms : [],
            updatedAt: doc.updatedAt,
          }
        : { arn: "", batch: "", terms: [], updatedAt: null },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertAdminStudentTranscript = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const { arn, batch, terms } = req.body || {};

    const next = {
      arn: arn != null ? String(arn).trim() : "",
      batch: batch != null ? String(batch).trim() : "",
      terms: normalizeTerms(terms),
    };

    const saved = await Transcript.findOneAndUpdate(
      { student: studentId },
      { $set: { student: studentId, ...next } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Transcript saved",
      transcript: {
        arn: saved.arn || "",
        batch: saved.batch || "",
        terms: Array.isArray(saved.terms) ? saved.terms : [],
        updatedAt: saved.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentTranscript,
  getAdminStudentTranscript,
  upsertAdminStudentTranscript,
};

