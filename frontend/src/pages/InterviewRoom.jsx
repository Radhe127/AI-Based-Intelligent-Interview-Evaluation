import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchInterviewStatus, getNextQuestion, submitAnswer, finishInterview } from "../api/client.js";
import { useSpeech } from "../hooks/useSpeech.js";

const MAX_QUESTIONS = 10;

export default function InterviewRoom() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const speech = useSpeech();
  const initDone = useRef(false);

  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [lastScore, setLastScore] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [loadingQ, setLoadingQ] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [hasSpoken, setHasSpoken] = useState(false);
  const [usedMic, setUsedMic] = useState(false);

  async function loadNextQuestion() {
    setError("");
    setLastScore(null);
    setAnswerText("");
    setHasSpoken(false);
    setUsedMic(false);
    speech.resetTranscript();
    setLoadingQ(true);
    try {
      const res = await getNextQuestion(interviewId);
      setQuestion(res.data);
      setQuestionCount((c) => c + 1);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to load question";
      setError(msg);
    } finally {
      setLoadingQ(false);
    }
  }

  // On mount: fetch server-side status to initialise question count correctly
  // and guard against re-entering a completed interview.
  useEffect(() => {
    if (initDone.current) return; // React StrictMode double-invoke guard
    initDone.current = true;

    async function init() {
      try {
        const res = await fetchInterviewStatus(interviewId);
        const { interview, questionCount: existing } = res.data;

        // Already done → go straight to the report
        if (interview.status === "completed") {
          navigate(`/report/${interviewId}`, { replace: true });
          return;
        }

        setQuestionCount(existing);

        // Already at or past limit → show only the finish button, no new question
        if (existing >= MAX_QUESTIONS) {
          setLoadingQ(false);
          return;
        }

        loadNextQuestion();
      } catch {
        // Fallback: just try loading a question; backend will reject if needed
        loadNextQuestion();
      }
    }

    init();
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
      setUsedMic(true);
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
        transcribedVoice: usedMic, // only true when the mic was actually used
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

        {/* At the limit with no question loaded yet — just show finish */}
        {!loadingQ && !question && reachedLimit && (
          <div className="question-box" style={{ color: "var(--text-dim)" }}>
            You've answered all {MAX_QUESTIONS} questions. Finish to see your scorecard.
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {!lastScore ? (
          question ? (
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
          ) : reachedLimit ? (
            <button className="btn btn-primary btn-block btn-lg" onClick={handleFinish} disabled={finishing}>
              {finishing ? "Generating your scorecard..." : "Finish & View Scorecard →"}
            </button>
          ) : null
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
