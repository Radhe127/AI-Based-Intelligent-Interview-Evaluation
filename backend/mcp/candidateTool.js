const User = require("../models/User");
const Resume = require("../models/Resume");
const Interview = require("../models/Interview");
const Score = require("../models/Score");

/**
 * Candidate Context Tool
 * Builds the AI context object from the user's profile + their most
 * recent scanned resume + their past interview performance.
 */

async function getCandidateContext(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error("Candidate not found");

  const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });

  const pastInterviews = await Interview.find({ userId, status: "completed" })
    .sort({ createdAt: -1 })
    .limit(5);

  const interviewIds = pastInterviews.map((i) => i._id);
  const pastScores = await Score.find({ interviewId: { $in: interviewIds } });

  const avgScore =
    pastScores.length > 0
      ? pastScores.reduce((sum, s) => sum + s.overallScore, 0) / pastScores.length
      : null;

  return {
    name: user.name,
    targetRole: user.targetRole,
    experience: resume?.extractedExperienceLevel || user.experience,
    skills: resume?.extractedSkills?.length ? resume.extractedSkills : user.skills,
    resumeSummary: resume?.summary || "",
    suggestedDomain: resume?.suggestedDomain || "Java",
    previousScore: avgScore !== null ? Number(avgScore.toFixed(1)) : null,
    pastInterviewCount: pastInterviews.length,
  };
}

module.exports = { getCandidateContext };
