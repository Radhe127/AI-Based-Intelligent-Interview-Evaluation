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

// Generate the next question
router.post("/:interviewId/next-question", requireAuth, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: req.userId });
    if (!interview) return res.status(404).json({ error: "Interview not found" });

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
      order: previousQuestions.length + 1,
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
    const question = await Question.findById(questionId);
    if (!interview || !question) {
      return res.status(404).json({ error: "Interview or question not found" });
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

    const score = await Score.create({
      interviewId,
      questionId,
      technicalScore: evaluation.technicalScore,
      communicationScore: evaluation.communicationScore,
      overallScore: evaluation.overallScore,
      remarks: evaluation.remarks,
    });

    res.json({ answer, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to evaluate answer" });
  }
});

// Finish interview -> generate final scorecard
router.post("/:interviewId/finish", requireAuth, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: req.userId });
    if (!interview) return res.status(404).json({ error: "Interview not found" });

    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    const qaRecords = [];

    for (const q of questions) {
      const answer = await Answer.findOne({ questionId: q._id }).sort({ createdAt: -1 });
      const score = await Score.findOne({ questionId: q._id }).sort({ createdAt: -1 });
      qaRecords.push({
        question: q.question,
        answer: answer ? answer.answer : null,
        technicalScore: score ? score.technicalScore : null,
        communicationScore: score ? score.communicationScore : null,
        overallScore: score ? score.overallScore : null,
      });
    }

    const candidateContext = await getCandidateContext(req.userId);

    const feedback = await generateFeedback({
      technology: interview.technology,
      candidateContext,
      qaRecords,
    });

    const validRecords = qaRecords.filter((r) => r.overallScore !== null);
    const averageScore =
      validRecords.length > 0
        ? validRecords.reduce((a, b) => a + b.overallScore, 0) / validRecords.length
        : 0;
    const technicalAvg =
      validRecords.length > 0
        ? validRecords.reduce((a, b) => a + b.technicalScore, 0) / validRecords.length
        : 0;
    const communicationAvg =
      validRecords.length > 0
        ? validRecords.reduce((a, b) => a + b.communicationScore, 0) / validRecords.length
        : 0;

    const report = await FeedbackReport.create({
      interviewId,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      summary: feedback.summary,
      resumeAlignment: feedback.resumeAlignment,
      recommendedNextSteps: feedback.recommendedNextSteps,
      averageScore: Number(averageScore.toFixed(2)),
      technicalAvg: Number(technicalAvg.toFixed(2)),
      communicationAvg: Number(communicationAvg.toFixed(2)),
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

    const qaRecords = [];
    for (const q of questions) {
      const answer = await Answer.findOne({ questionId: q._id }).sort({ createdAt: -1 });
      const score = await Score.findOne({ questionId: q._id }).sort({ createdAt: -1 });
      qaRecords.push({
        question: q.question,
        answer: answer ? answer.answer : null,
        technicalScore: score ? score.technicalScore : null,
        communicationScore: score ? score.communicationScore : null,
        overallScore: score ? score.overallScore : null,
        remarks: score ? score.remarks : "",
      });
    }

    res.json({ interview, report, qaRecords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// List all interviews for the logged-in candidate (dashboard history)
router.get("/", requireAuth, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ interviews });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interviews" });
  }
});

module.exports = router;
