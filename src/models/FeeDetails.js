const mongoose = require("mongoose");

const registrationRowSchema = new mongoose.Schema(
  {
    srNo: { type: Number, default: 0 },
    title: { type: String, trim: true, default: "" },
    requestType: { type: String, trim: true, default: "Registration" },
    status: { type: String, trim: true, default: "Approved" },
    actionDate: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const paymentRowSchema = new mongoose.Schema(
  {
    srNo: { type: Number, default: 0 },
    semester: { type: String, trim: true, default: "" },
    challanNo: { type: String, trim: true, default: "" },
    instrumentType: { type: String, trim: true, default: "Paid Bank Challan" },
    instrumentNo: { type: String, trim: true, default: "" },
    amount: { type: Number, default: 0 },
    dueDate: { type: String, trim: true, default: "" },
    paymentDate: { type: String, trim: true, default: "" },
    enteredBy: { type: String, trim: true, default: "Kuickpay" },
    status: { type: String, trim: true, default: "Posted" },
    operation: { type: String, trim: true, default: "Remarks" },
  },
  { _id: false }
);

const installmentSchema = new mongoose.Schema(
  {
    srNo: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    challanNo: { type: String, trim: true, default: "" },
    dueDate: { type: String, trim: true, default: "" },
    status: { type: String, trim: true, default: "Paid" },
  },
  { _id: false }
);

const termSchema = new mongoose.Schema(
  {
    term: { type: String, trim: true, required: true },
    arrears: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    sponsored: { type: Number, default: 0 },
    collection: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    studentActivitiesFund: { type: Number, default: 0 },
    tuitionFee: { type: Number, default: 0 },
    sgpa: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 },
    registrationLog: { type: [registrationRowSchema], default: [] },
    installments: { type: [installmentSchema], default: [] },
    paymentRows: { type: [paymentRowSchema], default: [] },
  },
  { _id: false, suppressReservedKeysWarning: true }
);

const feeDetailsSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    terms: { type: [termSchema], default: [] },
    paymentRows: { type: [paymentRowSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeDetails", feeDetailsSchema);

