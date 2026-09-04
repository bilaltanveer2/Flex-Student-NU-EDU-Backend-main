const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true },
    homePhone: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    city: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const academicCalendarSchema = new mongoose.Schema(
  {
    registration: { type: String, trim: true },
    onlineFeedback1: { type: String, trim: true },
    classes: { type: String, trim: true },
    onlineFeedback2: { type: String, trim: true },
    onlineWithdrawRequest: { type: String, trim: true },
    onlineRetakeRequest: { type: String, trim: true },
  },
  { _id: false }
);

const familyInformationSchema = new mongoose.Schema(
  {
    relation: { type: String, trim: true },
    name: { type: String, trim: true },
    cnic: { type: String, trim: true },
    forWithHoldingTax: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    loginId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    campus: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      default: "Current",
    },
    gender: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    dob: {
      type: String,
      trim: true,
    },
    cnic: {
      type: String,
      trim: true,
    },
    mobileNo: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      trim: true,
    },
    nationality: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    permanentAddress: addressSchema,
    currentAddress: addressSchema,
    academicCalendar: academicCalendarSchema,
    familyInformation: [familyInformationSchema],
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
