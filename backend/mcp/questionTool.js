const { callNvidiaModel, safeParseJSON } = require("./aiModelTool");

async function generateQuestion({ technology, difficulty, candidateContext, previousQuestions = [] }) {
  const systemPrompt = `You are an expert technical interviewer conducting a real-time verbal interview.
You generate ONE focused, conversational interview question at a time, tailored to the
candidate's resume and the chosen domain. Keep it natural enough to be spoken aloud.
Always respond ONLY with strict JSON: {"question": "..."}
No markdown, no preamble, no explanation outside the JSON.`;

  const userPrompt = `
Candidate context (from resume + profile): ${JSON.stringify(candidateContext)}
Domain: ${technology}
Difficulty: ${difficulty}
Questions already asked: ${JSON.stringify(previousQuestions)}

Generate ONE new, non-repetitive, conversational interview question suited to this candidate's background.
`;

  const raw = await callNvidiaModel(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.7, maxTokens: 300 }
  );

  const parsed = safeParseJSON(raw);
  if (!parsed.question) throw new Error("Model response missing 'question' field");
  return parsed.question;
}

module.exports = { generateQuestion };
