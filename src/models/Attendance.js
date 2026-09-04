const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    lectureNo: { type: Number },
    date: { type: String, trim: true },
    durationHours: { type: Number },
    presence: { type: String, enum: ["P", "A"], default: "P" },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    lectures: { type: [lectureSchema], default: [] },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    term: { type: String, required: true, trim: true, index: true },
    courses: { type: [courseSchema], default: [] },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, term: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);

