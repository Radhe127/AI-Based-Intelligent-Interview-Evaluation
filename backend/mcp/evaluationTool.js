const { callNvidiaModel, safeParseJSON } = require("./aiModelTool");

async function evaluateAnswer({ question, answer, technology, difficulty }) {
  const systemPrompt = `You are a strict but fair technical interview evaluator scoring a
verbally-transcribed answer. Score on a 0-10 scale.
Always respond ONLY with strict JSON:
{"technicalScore": number, "communicationScore": number, "overallScore": number, "remarks": "short one-sentence remark"}
No markdown, no preamble, no explanation outside the JSON.`;

  const userPrompt = `
Technology: ${technology}
Difficulty: ${difficulty}
Question: ${question}
Candidate's spoken answer (transcribed): ${answer}

Evaluate correctness, technical depth, and verbal communication clarity.
`;

  const raw = await callNvidiaModel(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.3, maxTokens: 300 }
  );

  const parsed = safeParseJSON(raw);

  return {
    technicalScore: Number(parsed.technicalScore) || 0,
    communicationScore: Number(parsed.communicationScore) || 0,
    overallScore: Number(parsed.overallScore) || 0,
    remarks: parsed.remarks || "",
  };
}

module.exports = { evaluateAnswer };
