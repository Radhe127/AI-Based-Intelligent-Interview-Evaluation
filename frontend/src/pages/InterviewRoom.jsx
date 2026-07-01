import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNextQuestion, submitAnswer, finishInterview } from "../api/client.js";
import { useSpeech } from "../hooks/useSpeech.js";

const MAX_QUESTIONS = 5;

export default function InterviewRoom() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const speech = useSpeech();

  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [lastScore, setLastScore] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [loadingQ, setLoadingQ] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [hasSpoken, setHasSpoken] = useState(false);

  async function loadNextQuestion() {
    setError("");
    setLastScore(null);
    setAnswerText("");
    setHasSpoken(false);
    speech.resetTranscript();
    setLoadingQ(true);
    try {
      const res = await getNextQuestion(interviewId);
      setQuestion(res.data);
      setQuestionCount((c) => c + 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load question");
    } finally {
      setLoadingQ(false);
    }
  }

  useEffect(() => {
    loadNextQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  // Speak the question aloud once it's loaded
  useEffect(() => {
    if (question && !loadingQ && !hasSpoken && speech.isSupported) {
      speech.speak(question.question);
      setHasSpoken(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, loadingQ]);

  // Keep the textarea synced with live transcript while listening
  useEffect(() => {
    if (speech.isListening) {
      setAnswerText(speech.transcript);
    }
  }, [speech.transcript, speech.isListening]);

  function handleMicToggle() {
    if (speech.isListening) {
      speech.stopListening();
    } else {
      speech.startListening();
    }
  }

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    if (!answerText.trim()) return;
    if (speech.isListening) speech.stopListening();

    setError("");
    setSubmitting(true);
    try {
      const res = await submitAnswer(interviewId, {
        questionId: question._id,
        answerText,
        transcribedVoice: speech.isSupported,
      });
      setLastScore(res.data.score);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFinish() {
    setFinishing(true);
    setError("");
    try {
      await finishInterview(interviewId);
      navigate(`/report/${interviewId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to finish interview");
      setFinishing(false);
    }
  }

  const reachedLimit = questionCount >= MAX_QUESTIONS;
  const progressPct = Math.min(100, Math.round((questionCount / MAX_QUESTIONS) * 100));

  return (
    <div className="app-shell">
      <div className="progress-track" style={{ marginTop: 24 }}>
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="interview-stage">
        <div className={`ai-avatar ${speech.isSpeaking ? "speaking" : ""}`}>🤖</div>
        <p className="muted">
          Question {questionCount} of {MAX_QUESTIONS}
          {speech.isSpeaking && " · AI interviewer is speaking..."}
        </p>

        {loadingQ && <p style={{ marginTop: 20 }}>Generating your next question...</p>}

        {!loadingQ && question && <div className="question-box">{question.question}</div>}

        {error && <div className="error-box">{error}</div>}

        {!lastScore ? (
          <form onSubmit={handleSubmitAnswer}>
            {speech.isSupported && (
              <>
                <button
                  type="button"
                  className={`mic-btn ${speech.isListening ? "listening" : ""}`}
                  onClick={handleMicToggle}
                  disabled={loadingQ}
                >
                  {speech.isListening ? "■" : "🎤"}
                </button>
                <p className="muted" style={{ marginBottom: 14 }}>
                  {speech.isListening ? "Listening... tap to stop" : "Tap the mic to answer out loud"}
                </p>
              </>
            )}

            <div style={{ textAlign: "left" }}>
              <label className="label">
                {speech.isSupported ? "Transcript (you can edit before submitting)" : "Your answer"}
              </label>
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Your answer will appear here as you speak, or type it directly..."
                disabled={loadingQ}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || loadingQ}>
              {submitting ? "Evaluating your answer..." : "Submit Answer"}
            </button>
          </form>
        ) : (
          <div>
            <div className="score-row">
              <div className="score-pill">
                <div className="val">{lastScore.technicalScore}</div>
                <div className="lab">Technical</div>
              </div>
              <div className="score-pill">
                <div className="val">{lastScore.communicationScore}</div>
                <div className="lab">Communication</div>
              </div>
              <div className="score-pill">
                <div className="val">{lastScore.overallScore}</div>
                <div className="lab">Overall</div>
              </div>
            </div>

            {lastScore.remarks && <p className="muted" style={{ marginBottom: 18 }}>{lastScore.remarks}</p>}

            {reachedLimit ? (
              <button className="btn btn-primary btn-block btn-lg" onClick={handleFinish} disabled={finishing}>
                {finishing ? "Generating your scorecard..." : "Finish & View Scorecard →"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-primary btn-block" onClick={loadNextQuestion}>
                  Next Question
                </button>
                <button className="btn btn-ghost" onClick={handleFinish} disabled={finishing}>
                  {finishing ? "Ending..." : "End Early"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
