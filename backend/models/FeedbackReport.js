const mongoose = require("mongoose");

const FeedbackReportSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    summary: { type: String, default: "" },
    averageScore: { type: Number, default: 0 },
    technicalAvg: { type: Number, default: 0 },
    communicationAvg: { type: Number, default: 0 },
    resumeAlignment: { type: String, default: "" },
    recommendedNextSteps: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedbackReport", FeedbackReportSchema);
