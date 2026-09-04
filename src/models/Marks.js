const mongoose = require("mongoose");

const markRowSchema = new mongoose.Schema(
  {
    rowLabel: { type: String, trim: true, default: "" },
    weightage: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    stdDev: { type: mongoose.Schema.Types.Mixed, default: null },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    isTotalRow: { type: Boolean, default: false },
  },
  { _id: false }
);

const markSectionSchema = new mongoose.Schema(
  {
    key: { type: String, trim: true, required: true },
    label: { type: String, trim: true, default: "" },
    rows: { type: [markRowSchema], default: [] },
  },
  { _id: false }
);

const marksCourseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    sections: { type: [markSectionSchema], default: [] },
  },
  { _id: false }
);

const marksSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    term: { type: String, required: true, trim: true, index: true },
    courses: { type: [marksCourseSchema], default: [] },
  },
  { timestamps: true }
);

marksSchema.index({ student: 1, term: 1 }, { unique: true });

module.exports = mongoose.model("Marks", marksSchema);
