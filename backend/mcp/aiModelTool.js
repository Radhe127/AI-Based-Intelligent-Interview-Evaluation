const axios = require("axios");

const NVIDIA_API_URL =
  process.env.NVIDIA_API_URL || "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || "openai/gpt-oss-20b";

async function callNvidiaModel(messages, options = {}) {
  const { temperature = 0.6, maxTokens = 1024 } = options;

  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not set in .env");
  }

  try {
    const response = await axios.post(
      NVIDIA_API_URL,
      {
        model: NVIDIA_MODEL,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from NVIDIA API");
    }
    return content.trim();
  } catch (err) {
    const detail = err.response?.data || err.message;
    console.error("NVIDIA API error:", detail);
    throw new Error("Failed to get a response from the AI model");
  }
}

function safeParseJSON(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const candidate =
    firstBrace !== -1 && lastBrace !== -1 ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;
  try {
    return JSON.parse(candidate);
  } catch (err) {
    console.error("JSON parse failed for model output:", cleaned);
    throw new Error("Model did not return valid JSON");
  }
}

module.exports = { callNvidiaModel, safeParseJSON };
