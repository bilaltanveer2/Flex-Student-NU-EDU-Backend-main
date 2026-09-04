const FeeDetails = require("../models/FeeDetails");
const User = require("../models/User");

const toNum = (v, fallback = 0) => {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeRegistration = (r, idx) => ({
  srNo: toNum(r?.srNo, idx + 1),
  title: r?.title != null ? String(r.title).trim() : "",
  requestType: r?.requestType != null ? String(r.requestType).trim() : "Registration",
  status: r?.status != null ? String(r.status).trim() : "Approved",
  actionDate: r?.actionDate != null ? String(r.actionDate).trim() : "",
});

const normalizePayment = (r, idx) => ({
  srNo: toNum(r?.srNo, idx + 1),
  semester: r?.semester != null ? String(r.semester).trim() : "",
  challanNo: r?.challanNo != null ? String(r.challanNo).trim() : "",
  instrumentType: r?.instrumentType != null ? String(r.instrumentType).trim() : "Paid Bank Challan",
  instrumentNo: r?.instrumentNo != null ? String(r.instrumentNo).trim() : "",
  amount: toNum(r?.amount, 0),
  dueDate: r?.dueDate != null ? String(r.dueDate).trim() : "",
  paymentDate: r?.paymentDate != null ? String(r.paymentDate).trim() : "",
  enteredBy: r?.enteredBy != null ? String(r.enteredBy).trim() : "Kuickpay",
  status: r?.status != null ? String(r.status).trim() : "Posted",
  operation: r?.operation != null ? String(r.operation).trim() : "Remarks",
});

const normalizeInstallment = (r, idx) => ({
  srNo: toNum(r?.srNo, idx + 1),
  amount: toNum(r?.amount, 0),
  challanNo: r?.challanNo != null ? String(r.challanNo).trim() : "",
  dueDate: r?.dueDate != null ? String(r.dueDate).trim() : "",
  status: r?.status != null ? String(r.status).trim() : "Paid",
});

const normalizeTerm = (t) => ({
  term: t?.term != null ? String(t.term).trim() : "",
  arrears: toNum(t?.arrears, 0),
  due: toNum(t?.due, 0),
  discount: toNum(t?.discount, 0),
  sponsored: toNum(t?.sponsored, 0),
  collection: toNum(t?.collection, 0),
  balance: toNum(t?.balance, 0),
  studentActivitiesFund: toNum(t?.studentActivitiesFund, 0),
  tuitionFee: toNum(t?.tuitionFee, 0),
  sgpa: toNum(t?.sgpa, 0),
  cgpa: toNum(t?.cgpa, 0),
  registrationLog: Array.isArray(t?.registrationLog) ? t.registrationLog.map(normalizeRegistration) : [],
  installments: Array.isArray(t?.installments)
    ? t.installments.map(normalizeInstallment)
    : Array.isArray(t?.paymentRows)
      ? t.paymentRows.map(normalizeInstallment)
      : [],
});

const normalizeTerms = (terms = []) => (Array.isArray(terms) ? terms.map(normalizeTerm).filter((x) => x.term) : []);
const normalizePaymentRows = (rows = []) => (Array.isArray(rows) ? rows.map(normalizePayment) : []);

const getStudentFeeDetails = async (req, res) => {
  try {
    const doc = await FeeDetails.findOne({ student: req.user._id });
    return res.status(200).json({
      message: "Fee details",
      terms: doc?.terms || [],
      paymentRows: doc?.paymentRows || [],
      updatedAt: doc?.updatedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminStudentFeeDetails = async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-passwordHash");
    if (!student || student.role !== "student") return res.status(404).json({ message: "Student not found" });
    const doc = await FeeDetails.findOne({ student: req.params.id });
    return res.status(200).json({
      message: "Fee details",
      student,
      terms: doc?.terms || [],
      paymentRows: doc?.paymentRows || [],
      updatedAt: doc?.updatedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertAdminStudentFeeDetails = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student || student.role !== "student") return res.status(404).json({ message: "Student not found" });
    const terms = normalizeTerms(req.body?.terms || []);
    const paymentRows = normalizePaymentRows(
      req.body?.paymentRows || (Array.isArray(req.body?.terms) ? req.body.terms.flatMap((t) => t?.paymentRows || []) : [])
    );
    const saved = await FeeDetails.findOneAndUpdate(
      { student: req.params.id },
      { $set: { student: req.params.id, terms, paymentRows } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({
      message: "Fee details saved",
      terms: saved?.terms || [],
      paymentRows: saved?.paymentRows || [],
      updatedAt: saved?.updatedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentFeeDetails, getAdminStudentFeeDetails, upsertAdminStudentFeeDetails };

