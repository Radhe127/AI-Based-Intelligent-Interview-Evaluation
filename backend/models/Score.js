const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema(
  {
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Score", ScoreSchema);
