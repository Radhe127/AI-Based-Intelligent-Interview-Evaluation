const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const router = express.Router();

const requireAuth = require("../middleware/auth");
const Resume = require("../models/Resume");
const User = require("../models/User");
const { scanResume } = require("../mcp/resumeTool");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF or TXT resumes are supported"));
  },
});

// Upload resume -> extract text -> AI scan -> store
router.post("/upload", requireAuth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume file uploaded" });
    }

    let rawText = "";
    if (req.file.mimetype === "application/pdf") {
      const parsed = await pdfParse(req.file.buffer);
      rawText = parsed.text;
    } else {
      rawText = req.file.buffer.toString("utf-8");
    }

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({
        error: "Could not extract readable text from the resume. Please upload a text-based PDF or TXT file.",
      });
    }

    const scan = await scanResume(rawText);

    const resume = await Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      rawText,
      ...scan,
    });

    await User.findByIdAndUpdate(req.userId, {
      hasResume: true,
      skills: scan.extractedSkills,
      experience: scan.extractedExperienceLevel,
    });

    res.status(201).json({ resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to process resume" });
  }
});

// Get the candidate's latest scanned resume
router.get("/latest", requireAuth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ error: "No resume uploaded yet" });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

module.exports = router;
