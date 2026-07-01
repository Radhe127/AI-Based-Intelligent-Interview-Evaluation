const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },

    // AI scan results (4.1-style candidate context, derived from resume)
    atsScore: { type: Number, default: 0 },
    extractedSkills: { type: [String], default: [] },
    extractedExperienceLevel: { type: String, default: "Fresher" },
    suggestedDomain: { type: String, default: "Java" },
    summary: { type: String, default: "" },
    resumeStrengths: { type: [String], default: [] },
    resumeImprovements: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
