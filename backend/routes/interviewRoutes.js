const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/auth");
const Interview = require("../models/Interview");
const Question = require("../models/Question");
const Answer = require("../models/Answer");
const Score = require("../models/Score");
const FeedbackReport = require("../models/FeedbackReport");
const Resume = require("../models/Resume");

const { getCandidateContext } = require("../mcp/candidateTool");
const { generateQuestion } = require("../mcp/questionTool");
const { evaluateAnswer } = require("../mcp/evaluationTool");
const { generateFeedback } = require("../mcp/feedbackTool");

const MAX_QUESTIONS = 10;

// Schedule + immediately start a real-time interview (resume required)
router.post("/start", requireAuth, async (req, res) => {
  try {
    const { technology, difficulty, mode } = req.body;

    const resume = await Resume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(400).json({ error: "Upload and scan a resume before starting an interview" });
    }

    const candidateContext = await getCandidateContext(req.userId);

    const interview = await Interview.create({
      userId: req.userId,
      resumeId: resume._id,
      technology: technology || candidateContext.suggestedDomain || "Java",
      difficulty: difficulty || "Intermediate",
      mode: mode === "text" ? "text" : "voice",
      status: "in-progress",
    });

    res.json({ interview, candidateContext });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to start interview" });
  }
});

// Get interview status + existing question count (used by InterviewRoom on mount)
router.get("/:interviewId/status", requireAuth, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: req.userId });
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    const questionCount = await Question.countDocuments({ interviewId });
    res.json({ interview, questionCount, maxQuestions: MAX_QUESTIONS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch interview status" });
  }
});

// Generate the next question
router.post("/:interviewId/next-question", requireAuth, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: req.userId });
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    if (interview.status === "completed") {
      return res.status(409).json({ error: "This interview is already completed" });
    }

    const existingCount = await Question.countDocuments({ interviewId });
    if (existingCount >= MAX_QUESTIONS) {
      return res.status(400).json({ error: "Question limit reached. Finish the interview to see your scorecard." });
    }

    const candidateContext = await getCandidateContext(req.userId);
    const previousQuestions = (await Question.find({ interviewId })).map((q) => q.question);

    const questionText = await generateQuestion({
      technology: interview.technology,
      difficulty: interview.difficulty,
      candidateContext,
      previousQuestions,
    });

    const question = await Question.create({
      interviewId,
      question: questionText,
      order: existingCount + 1,
    });

    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to generate question" });
  }
});

// Submit an answer (voice-transcribed or typed) -> evaluate
router.post("/:interviewId/answer", requireAuth, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { questionId, answerText, transcribedVoice } = req.body;

    if (!questionId || !answerText) {
      return res.status(400).json({ error: "questionId and answerText are required" });
    }

    const interview = await Interview.findOne({ _id: interviewId, userId: req.userId });
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    if (interview.status === "completed") {
      return res.status(409).json({ error: "This interview is already completed" });
    }

    const question = await Question.findOne({ _id: questionId, interviewId });
    if (!question) {
      return res.status(404).json({ error: "Question not found for this interview" });
    }

    const answer = await Answer.create({
      questionId,
      answer: answerText,
      transcribedVoice: !!transcribedVoice,
    });

    const evaluation = await evaluateAnswer({
      question: question.question,
      answer: answerText,
      technology: interview.technology,
      difficulty: interview.difficulty,
    });

    // Clamp scores to 0-10
    const clamp = (v) => Math.min(10, Math.max(0, Number(v) || 0));

    const score = await Score.create({
      interviewId,
      questionId,
      technicalScore: clamp(evaluation.technicalScore),
      communicationScore: clamp(evaluation.communicationScore),
      overallScore: clamp(evaluation.overallScore),
      remarks: evaluation.remarks,
    });

    res.json({ answer, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to evaluate answer" });
  }
});

// Finish interview -> generate final scorecard (idempotent)
router.post("/:interviewId/finish", requireAuth, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: req.userId });
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    // Idempotent: return the existing report if the interview is already done
    if (interview.status === "completed") {
      const existingReport = await FeedbackReport.findOne({ interviewId });
      if (existingReport) {
        const questions = await Question.find({ interviewId }).sort({ order: 1 });
        const qaRecords = await buildQARecords(questions);
        return res.json({ report: existingReport, qaRecords });
      }
    }

    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    const qaRecords = await buildQARecords(questions);

    const candidateContext = await getCandidateContext(req.userId);

    const feedback = await generateFeedback({
      technology: interview.technology,
      candidateContext,
      qaRecords,
    });

    const validRecords = qaRecords.filter((r) => r.overallScore !== null);
    const avg = (key) =>
      validRecords.length > 0
        ? Number((validRecords.reduce((a, b) => a + b[key], 0) / validRecords.length).toFixed(2))
        : 0;

    const report = await FeedbackReport.create({
      interviewId,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      summary: feedback.summary,
      resumeAlignment: feedback.resumeAlignment,
      recommendedNextSteps: feedback.recommendedNextSteps,
      averageScore: avg("overallScore"),
      technicalAvg: avg("technicalScore"),
      communicationAvg: avg("communicationScore"),
    });

    interview.status = "completed";
    await interview.save();

    res.json({ report, qaRecords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to finish interview" });
  }
});

// Fetch a full interview report
router.get("/:interviewId/report", requireAuth, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: req.userId });
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    const report = await FeedbackReport.findOne({ interviewId });
    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    const qaRecords = await buildQARecords(questions, true);

    res.json({ interview, report, qaRecords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// List all interviews for the logged-in candidate (dashboard history) — includes scores
router.get("/", requireAuth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId }).sort({ createdAt: -1 });

    // Attach averageScore from FeedbackReport in a single bulk query
    const reports = await FeedbackReport.find({
      interviewId: { $in: interviews.map((iv) => iv._id) },
    });
    const reportMap = {};
    for (const r of reports) {
      reportMap[r.interviewId.toString()] = r;
    }

    const enriched = interviews.map((iv) => {
      const r = reportMap[iv._id.toString()];
      return {
        ...iv.toObject(),
        averageScore: r ? r.averageScore : null,
        technicalAvg: r ? r.technicalAvg : null,
        communicationAvg: r ? r.communicationAvg : null,
      };
    });

    res.json({ interviews: enriched });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interviews" });
  }
});

// ── helper ───────────────────────────────────────────────────────────────────

async function buildQARecords(questions, includeRemarks = false) {
  const records = [];
  for (const q of questions) {
    const answer = await Answer.findOne({ questionId: q._id }).sort({ createdAt: -1 });
    const score = await Score.findOne({ questionId: q._id }).sort({ createdAt: -1 });
    const record = {
      question: q.question,
      answer: answer ? answer.answer : null,
      technicalScore: score ? score.technicalScore : null,
      communicationScore: score ? score.communicationScore : null,
      overallScore: score ? score.overallScore : null,
    };
    if (includeRemarks) record.remarks = score ? score.remarks : "";
    records.push(record);
  }
  return records;
}

module.exports = router;
