const { callNvidiaModel, safeParseJSON } = require("./aiModelTool");

const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "node",
  "express",
  "java",
  "spring",
  "spring boot",
  "sql",
  "mongodb",
  "aws",
  "docker",
  "kubernetes",
  "python",
  "html",
  "css",
  "rest",
  "api",
  "git",
  "linux",
  "dsa",
];

function titleCase(value) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function detectSkills(rawText) {
  const lowerText = rawText.toLowerCase();
  return SKILL_KEYWORDS.filter((keyword) => lowerText.includes(keyword)).map(titleCase);
}

function detectExperienceLevel(rawText) {
  const lowerText = rawText.toLowerCase();
  const yearsMatch = lowerText.match(/(\d+)\s*\+?\s*years?/);
  if (yearsMatch) {
    const years = Number(yearsMatch[1]);
    if (years >= 5) return "5+ years";
    if (years >= 3) return "3-5 years";
    if (years >= 1) return "1-2 years";
  }

  if (lowerText.includes("intern") || lowerText.includes("fresher") || lowerText.includes("student")) {
    return "Fresher";
  }

  if (lowerText.includes("senior") || lowerText.includes("lead") || lowerText.includes("architect")) {
    return "5+ years";
  }

  if (lowerText.includes("mid") || lowerText.includes("developer") || lowerText.includes("engineer")) {
    return "1-2 years";
  }

  return "1-2 years";
}

function detectSuggestedDomain(skills, rawText) {
  const lowerSkills = skills.map((skill) => skill.toLowerCase());
  const lowerText = rawText.toLowerCase();

  if (lowerSkills.some((skill) => skill.includes("spring") || skill.includes("java"))) return "Spring Boot";
  if (lowerSkills.some((skill) => skill.includes("react") || skill.includes("javascript") || skill.includes("typescript"))) {
    return "React";
  }
  if (lowerSkills.some((skill) => skill.includes("sql") || skill.includes("python"))) return "DSA";
  if (lowerText.includes("full stack") || (lowerSkills.includes("React") && lowerSkills.some((skill) => skill.includes("node")))) {
    return "Full Stack";
  }
  if (lowerText.includes("hr") || lowerText.includes("communication") || lowerText.includes("behavioral")) {
    return "HR";
  }
  return "Java";
}

function buildFallbackScan(rawText) {
  const skills = detectSkills(rawText);
  const experienceLevel = detectExperienceLevel(rawText);
  const suggestedDomain = detectSuggestedDomain(skills, rawText);
  const topSkills = skills.slice(0, 5);
  const strengths = topSkills.length ? [`Core skills called out: ${topSkills.join(", ")}`] : ["Shows enough detail to build a focused practice plan"];
  const improvements = [];

  if (!/\d/.test(rawText)) improvements.push("Add measurable outcomes so your impact is easier to discuss");
  if ((rawText.match(/\n-/g) || []).length < 2) improvements.push("Use a few clear bullet points to make the resume easier to scan");
  if (skills.length < 4) improvements.push("Add a few more concrete technologies, tools, or domain keywords");
  if (!improvements.length) improvements.push("Sharpen one project story with problem, action, and result");

  return {
    atsScore: Math.max(48, Math.min(82, 50 + skills.length * 4 + (experienceLevel === "5+ years" ? 8 : experienceLevel === "3-5 years" ? 5 : 0))),
    extractedSkills: skills,
    extractedExperienceLevel: experienceLevel,
    suggestedDomain,
    summary: `This resume presents a ${experienceLevel} profile with a ${suggestedDomain} interview track in view. It gives enough context to practice confidently and focus on the few areas that matter most.`,
    resumeStrengths: strengths,
    resumeImprovements: improvements,
  };
}

/**
 * Resume Scan Tool
 * Sends extracted resume text to the LLM and gets back a structured
 * profile: skills, experience level, suggested interview domain,
 * ATS-style score, strengths, and improvement areas.
 */

async function scanResume(rawText) {
  const systemPrompt = `You are an expert technical recruiter and resume screener.
Analyze the candidate's resume text and return a structured JSON profile.
Always respond ONLY with strict JSON in this exact shape:
{
  "atsScore": number (0-100),
  "extractedSkills": ["skill1", "skill2", ...],
  "extractedExperienceLevel": "Fresher" | "1-2 years" | "3-5 years" | "5+ years",
  "suggestedDomain": "Java" | "Spring Boot" | "React" | "DSA" | "Full Stack" | "HR",
  "summary": "2-3 sentence summary of the candidate",
  "resumeStrengths": ["strength1", "strength2", ...],
  "resumeImprovements": ["improvement1", "improvement2", ...]
}
No markdown, no preamble, no text outside the JSON.`;

  const userPrompt = `Resume text:\n"""\n${rawText.slice(0, 8000)}\n"""\n\nAnalyze this resume.`;

  try {
    const raw = await callNvidiaModel(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.3, maxTokens: 800 }
    );

    const parsed = safeParseJSON(raw);

    return {
      atsScore: Number(parsed.atsScore) || 0,
      extractedSkills: Array.isArray(parsed.extractedSkills) ? parsed.extractedSkills : [],
      extractedExperienceLevel: parsed.extractedExperienceLevel || "Fresher",
      suggestedDomain: parsed.suggestedDomain || "Java",
      summary: parsed.summary || "",
      resumeStrengths: Array.isArray(parsed.resumeStrengths) ? parsed.resumeStrengths : [],
      resumeImprovements: Array.isArray(parsed.resumeImprovements) ? parsed.resumeImprovements : [],
    };
  } catch (err) {
    console.warn("Resume scan fallback activated:", err.message);
    return buildFallbackScan(rawText);
  }
}

module.exports = { scanResume };
