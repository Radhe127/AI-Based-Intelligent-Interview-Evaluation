const { callNvidiaModel, safeParseJSON } = require("./aiModelTool");

async function generateFeedback({ technology, candidateContext, qaRecords }) {
  const systemPrompt = `You are an expert technical interview coach and career advisor.
Given the candidate's resume-derived profile and their full interview transcript with scores,
produce a final scorecard report that connects resume content with live interview performance.
Always respond ONLY with strict JSON in this exact shape:
{
  "strengths": ["..."],
  "improvements": ["..."],
  "summary": "2-3 sentence overall summary",
  "resumeAlignment": "1-2 sentences on how well the live answers matched the resume claims",
  "recommendedNextSteps": ["actionable next step 1", "actionable next step 2", "..."]
}
No markdown, no preamble, no explanation outside the JSON.`;

  const userPrompt = `
Candidate context (resume + profile): ${JSON.stringify(candidateContext)}
Domain: ${technology}
Interview transcript (question, answer, scores): ${JSON.stringify(qaRecords)}

Produce the scorecard report.
`;

  const raw = await callNvidiaModel(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.5, maxTokens: 700 }
  );

  const parsed = safeParseJSON(raw);

  return {
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    summary: parsed.summary || "",
    resumeAlignment: parsed.resumeAlignment || "",
    recommendedNextSteps: Array.isArray(parsed.recommendedNextSteps) ? parsed.recommendedNextSteps : [],
  };
}

module.exports = { generateFeedback };
