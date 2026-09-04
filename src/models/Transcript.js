const mongoose = require("mongoose");

const transcriptRowSchema = new mongoose.Schema(
  {
    code: { type: String, trim: true },
    courseName: { type: String, trim: true },
    section: { type: String, trim: true },
    crHrs: { type: Number },
    grade: { type: String, trim: true },
    points: { type: Number },
    type: { type: String, trim: true },
    remarks: { type: String, trim: true },
    isHighlighted: { type: Boolean, default: false },
    linkDetails: {
      gradingScheme: { type: String, trim: true, default: "" },
      modifiedClassAverage: { type: Number, default: null },
    },
  },
  { _id: false }
);

const termSchema = new mongoose.Schema(
  {
    term: { type: String, required: true, trim: true },
    summary: {
      crAtt: { type: Number, default: 0 },
      crEarned: { type: Number, default: 0 },
      cgpa: { type: Number, default: 0 },
      sgpa: { type: Number, default: 0 },
    },
    rows: { type: [transcriptRowSchema], default: [] },
  },
  { _id: false }
);

const transcriptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    arn: { type: String, trim: true, default: "" },
    batch: { type: String, trim: true, default: "" },
    terms: { type: [termSchema], default: [] },
  },
  { timestamps: true }
);

transcriptSchema.index({ student: 1 }, { unique: true });

module.exports = mongoose.model("Transcript", transcriptSchema);

