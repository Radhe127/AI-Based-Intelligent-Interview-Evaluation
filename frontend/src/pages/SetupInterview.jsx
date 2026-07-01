import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startInterview } from "../api/client.js";

const DOMAINS = ["Java", "Spring Boot", "React", "DSA", "Full Stack", "HR"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function SetupInterview() {
  const navigate = useNavigate();
  const [technology, setTechnology] = useState("Spring Boot");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [mode, setMode] = useState("voice");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setError("");
    setLoading(true);
    try {
      const res = await startInterview({ technology, difficulty, mode });
      navigate(`/interview/${res.data.interview._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start interview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="narrow-shell">
      <div className="auth-card">
        <h2>Schedule your interview</h2>
        <p className="sub">Your scanned resume shapes a calmer, more relevant practice session.</p>

        <label className="label">Domain</label>
        <select value={technology} onChange={(e) => setTechnology(e.target.value)}>
          {DOMAINS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <label className="label">Difficulty</label>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {DIFFICULTIES.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <label className="label">Interview mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="voice">Real-time voice (recommended)</option>
          <option value="text">Typed answers</option>
        </select>

        {error && <div className="error-box">{error}</div>}

        <button className="btn btn-primary btn-block btn-lg" onClick={handleStart} disabled={loading}>
          {loading ? "Scheduling..." : "Start interview →"}
        </button>
      </div>
    </div>
  );
}
