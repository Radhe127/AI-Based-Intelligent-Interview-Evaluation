const mongoose = require("mongoose");

const InterviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },
    technology: { type: String, required: true },
    difficulty: { type: String, default: "Intermediate" },
    mode: { type: String, enum: ["voice", "text"], default: "voice" },
    status: { type: String, enum: ["scheduled", "in-progress", "completed"], default: "scheduled" },
    scheduledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", InterviewSchema);
