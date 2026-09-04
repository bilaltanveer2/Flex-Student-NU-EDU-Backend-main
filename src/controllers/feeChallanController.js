const FeeChallan = require("../models/FeeChallan");
const PDFDocument = require("pdfkit");
const User = require("../models/User");

const toNum = (v, fallback = 0) => {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const normalizeRow = (r) => ({
  amount: toNum(r?.amount, 0),
  generatedOn: r?.generatedOn != null ? String(r.generatedOn).trim() : "",
  dueDate: r?.dueDate != null ? String(r.dueDate).trim() : "",
  status: r?.status != null ? String(r.status).trim() : "Valid",
  challanNo: r?.challanNo != null ? String(r.challanNo).trim() : "",
  bankName: r?.bankName != null ? String(r.bankName).trim() : "Faysal bank",
  quickPayPaymentDetail:
    r?.quickPayPaymentDetail != null ? String(r.quickPayPaymentDetail).trim() : "View",
  paymentDetail: {
    studentActivitiesFund: toNum(r?.paymentDetail?.studentActivitiesFund, 0),
    onlinePaymentCharges1: toNum(r?.paymentDetail?.onlinePaymentCharges1, 0),
    tuitionFee: toNum(r?.paymentDetail?.tuitionFee, 0),
    onlinePaymentCharges2: toNum(r?.paymentDetail?.onlinePaymentCharges2, 0),
  },
});

const computedTotal = (row) => {
  const d = row?.paymentDetail || {};
  return (
    toNum(d.studentActivitiesFund, 0) +
    toNum(d.onlinePaymentCharges1, 0) +
    toNum(d.tuitionFee, 0) +
    toNum(d.onlinePaymentCharges2, 0)
  );
};

const withTotals = (rows = []) =>
  rows.map((r) => {
    const plain = typeof r?.toObject === "function" ? r.toObject() : { ...r };
    return {
      ...plain,
      _id: plain?._id || r?._id || null,
      computedTotal: computedTotal(plain),
    };
  });

const normalizeRows = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows
    .map(normalizeRow)
    .filter((r) => r.amount || r.generatedOn || r.dueDate || r.challanNo);
};

const getStudentFeeChallan = async (req, res) => {
  try {
    const studentId = req.user._id;
    const doc = await FeeChallan.findOne({ student: studentId });
    return res.status(200).json({
      message: "Fee challan",
      challans: withTotals(Array.isArray(doc?.challans) ? doc.challans : []),
      updatedAt: doc?.updatedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudentFeeChallanById = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { challanId } = req.params;
    const doc = await FeeChallan.findOne({ student: studentId });
    if (!doc) return res.status(404).json({ message: "Challan not found" });
    const challan = doc.challans.id(challanId);
    if (!challan) return res.status(404).json({ message: "Challan not found" });
    return res.status(200).json({
      message: "Fee challan",
      challan: { ...challan.toObject(), computedTotal: computedTotal(challan) },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudentFeeChallanPdf = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { challanId } = req.params;

    const student = await User.findById(studentId).select("name rollNumber degree batch");
    const doc = await FeeChallan.findOne({ student: studentId });
    if (!doc) return res.status(404).json({ message: "Challan not found" });
    const challan = doc.challans.id(challanId);
    if (!challan) return res.status(404).json({ message: "Challan not found" });

    const filename = `challan-${challan.challanNo || challanId}.pdf`;
    const wantsDownload = String(req.query.download || "") === "1";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${wantsDownload ? "attachment" : "inline"}; filename="${filename}"`
    );

    const pdf = new PDFDocument({ size: "A4", layout: "landscape", margin: 20 });
    pdf.pipe(res);

    const pageW = pdf.page.width;
    const margin = 20;
    const usable = pageW - margin * 2;
    const col1 = Math.floor(usable * 0.315);
    const col2 = Math.floor(usable * 0.315);
    const col3 = usable - col1 - col2;
    const x1 = margin;
    const x2 = x1 + col1;
    const x3 = x2 + col2;
    const top = margin;
    const bottom = pdf.page.height - margin;

    const lineBottom = bottom - 140;
    pdf.moveTo(x2, top).lineTo(x2, lineBottom).stroke("#111");
    pdf.moveTo(x3, top).lineTo(x3, lineBottom).stroke("#111");

    const detail = challan.paymentDetail || {};
    const total = computedTotal(challan);

    const drawCopy = (x, w, title) => {
      let y = top + 6;
      pdf.font("Times-Bold").fontSize(8).text(title, x + 6, y, { width: w - 12 });
      pdf.font("Times-Bold").fontSize(7).text(challan.challanNo || "-", x + w - 90, y, {
        width: 84,
        align: "right",
      });
      y += 24;
      pdf
        .font("Times-Roman")
        .fontSize(9.5)
        .text("Fee can be paid at all United Bank Limited or Faysal", x + 14, y, { width: w - 28, align: "center" });
      y += 13;
      pdf.fontSize(9.5).text("Bank branches across Pakistan", x + 14, y, { width: w - 28, align: "center" });
      y += 26;

      const rowsA = [
        ["Due Date:", challan.dueDate || "-"],
        ["Name:", student?.name || "-"],
        ["Discipline:", student?.degree || "-"],
        ["Roll No:", student?.rollNumber || "-"],
        ["Semester:", student?.batch || "-"],
        ["Challan:", challan.challanNo || "-"],
      ];
      pdf.fontSize(8);
      rowsA.forEach(([k, v]) => {
        pdf.font("Times-Roman").text(k, x + 6, y);
        pdf.font("Times-Bold").text(String(v), x + 70, y);
        y += 11.5;
      });
      y += 5;
      const rowsB = [
        ["Admission Fee:", "Rs. 0"],
        ["Tuition Fee:", `Rs. ${toNum(detail.tuitionFee, 0).toLocaleString()}`],
        ["Online:", `Rs. ${toNum(detail.onlinePaymentCharges1, 0).toLocaleString()}`],
        ["Others:", `Rs. ${toNum(detail.studentActivitiesFund, 0).toLocaleString()}`],
        ["Withholding Tax:", "Rs. 0"],
        ["Payment With-in Due Date:", `Rs. ${toNum(challan.amount || total, 0).toLocaleString()}`],
      ];
      rowsB.forEach(([k, v]) => {
        pdf.font("Times-Roman").text(k, x + 6, y);
        pdf.font("Times-Roman").text("Rs.:", x + 112, y);
        pdf.font("Times-Roman").text(v.replace("Rs. ", ""), x + w - 56, y, { width: 50, align: "right" });
        y += 11.5;
      });

      y += 12;
      pdf.font("Times-Bold").text("Deposited By :", x + 14, y);
      pdf.font("Times-Bold").text("Bank Officer Stamp and Signature:", x + 88, y);
      y = lineBottom - 26;
      pdf.font("Times-Roman").fontSize(7).text("Errors and omission, if any, will be adjusted subsequently", x + 8, y);
    };

    drawCopy(x1, col1, "BANK COPY");
    drawCopy(x2, col2, "STUDENT COPY");

    let ry = top + 8;
    pdf.font("Times-Roman").fontSize(8).text("Fee can be paid using any one of the following methods:", x3 + 8, ry, { width: col3 - 16 });
    ry += 20;
    pdf.font("Times-Bold").fontSize(8).text("1.Print the challan form and then visit any nearest United Bank Limited or Faysal", x3 + 8, ry, { width: col3 - 16 });
    ry += 12;
    pdf.font("Times-Bold").fontSize(8).text("bank branch for cash deposit.", x3 + 8, ry, { width: col3 - 16 });
    ry += 20;
    pdf.font("Times-Bold").fontSize(8).text(`UBL: MCA A/C ${challan.challanNo || "-"}`, x3 + 8, ry, { width: col3 - 16, align: "center" });
    ry += 12;
    pdf.font("Times-Bold").fontSize(8).text("Faysal Bank: FAST-ISD", x3 + 8, ry, { width: col3 - 16, align: "center" });
    ry += 18;
    pdf.font("Times-Bold").fontSize(8).text("2.Via bank account using kuickpay payment gateway.", x3 + 8, ry, { width: col3 - 16 });
    ry += 14;
    const steps = [
      "Step 1: Sign in to your Internet Banking, Mobile Banking or visit an ATM machine",
      "Step 2: Select Bill Payment / Payments and then select 'kuickpay' from given categories",
      `Step 3: Enter the voucher number ${challan.challanNo || "-"} & continue`,
      "Step 4: Confirm your voucher details and proceed to payment. Payment alerts will be received accordingly.",
    ];
    pdf.font("Times-Roman").fontSize(7.3);
    steps.forEach((s) => {
      pdf.text(s, x3 + 8, ry, { width: col3 - 16 });
      ry += 22;
    });
    pdf.font("Times-Bold").fontSize(7.5).text("*Customers of following Banks can avail Kuickpay service", x3 + 8, ry, { width: col3 - 16 });
    ry += 14;
    pdf.font("Times-Roman").fontSize(7.2).text("Allied Bank, Askari Bank, Bank Al Habib, Bank Alfalah, Bank Islami, Bank of Punjab, Dubai Islamic Bank, Faysal Bank, First Women Bank, Habib Metro Bank, Habib Bank Limited, JS Bank, MCB Bank, MCB Islamic Bank, Meezan Bank, National Bank, UBL and Keenu App.", x3 + 8, ry, { width: col3 - 16 });
    ry += 42;
    pdf.font("Times-Bold").fontSize(7.3).text("*Easy paisa and JazzCash can also be used for payment via kuickpay. (Transaction Limit apply)", x3 + 8, ry, { width: col3 - 16 });
    ry += 24;
    pdf.font("Times-Roman").fontSize(7.3).text("For further clarification, please visit", x3 + 8, ry, { width: col3 - 16 });
    ry += 10;
    pdf.font("Times-Roman").fontSize(7.3).text("https://app.kuickpay.com/PaymentsBillPayment", x3 + 8, ry, {
      width: col3 - 16,
      underline: true,
      link: "https://app.kuickpay.com/PaymentsBillPayment",
    });
    ry += 16;
    pdf.font("Times-Roman").fontSize(7.3).text("kuickpay will charge Rs 60 per transaction", x3 + 8, ry, { width: col3 - 16 });

    pdf.end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAdminStudentFeeChallan = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId).select("-passwordHash");
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const doc = await FeeChallan.findOne({ student: studentId });
    return res.status(200).json({
      message: "Fee challan",
      student,
      challans: withTotals(Array.isArray(doc?.challans) ? doc.challans : []),
      updatedAt: doc?.updatedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const upsertAdminStudentFeeChallan = async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const rows = normalizeRows(req.body?.challans || []);
    const saved = await FeeChallan.findOneAndUpdate(
      { student: studentId },
      { $set: { student: studentId, challans: rows } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Fee challan saved",
      challans: withTotals(Array.isArray(saved?.challans) ? saved.challans : []),
      updatedAt: saved?.updatedAt || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentFeeChallan,
  getStudentFeeChallanById,
  getStudentFeeChallanPdf,
  getAdminStudentFeeChallan,
  upsertAdminStudentFeeChallan,
};

