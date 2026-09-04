const mongoose = require("mongoose");

const paymentDetailSchema = new mongoose.Schema(
  {
    studentActivitiesFund: { type: Number, default: 0 },
    onlinePaymentCharges1: { type: Number, default: 0 },
    tuitionFee: { type: Number, default: 0 },
    onlinePaymentCharges2: { type: Number, default: 0 },
  },
  { _id: false }
);

const challanRowSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 },
    generatedOn: { type: String, trim: true, default: "" },
    dueDate: { type: String, trim: true, default: "" },
    status: { type: String, trim: true, default: "Valid" },
    challanNo: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "Faysal bank" },
    quickPayPaymentDetail: { type: String, trim: true, default: "View" },
    paymentDetail: { type: paymentDetailSchema, default: () => ({}) },
  },
  { timestamps: false }
);

const feeChallanSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    challans: { type: [challanRowSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeeChallan", feeChallanSchema);

