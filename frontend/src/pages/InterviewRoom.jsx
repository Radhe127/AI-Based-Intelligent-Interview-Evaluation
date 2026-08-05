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
  const [voiceAnswering, setVoiceAnswering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== "undefined" ? Boolean(document.fullscreenElement) : false
  );

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  useEffect(() => {
    enterFullscreen();
    // Intentionally attempt fullscreen again when the interview screen mounts.
    // If the browser blocks it, the interview still works normally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enterFullscreen() {
    if (!document.documentElement.requestFullscreen || document.fullscreenElement) return;
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      setError("Your browser blocked fullscreen mode. You can continue without it.");
    }
  }

  async function exitFullscreen() {
    if (!document.exitFullscreen || !document.fullscreenElement) return;
    try {
      await document.exitFullscreen();
    } catch {
      setError("Could not exit fullscreen mode.");
    }
  }

  async function loadNextQuestion() {
    setError("");
    setLastScore(null);
    setAnswerText("");
    setHasSpoken(false);
    setVoiceAnswering(false);
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

  async function submitCurrentAnswer(answerValue, transcribedVoice) {
    if (!answerValue.trim() || !question) return;

    setError("");
    setSubmitting(true);
    try {
      const res = await submitAnswer(interviewId, {
        questionId: question._id,
        answerText: answerValue,
        transcribedVoice,
      });
      setLastScore(res.data.score);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVoiceButtonClick() {
    if (speech.isListening) {
      const finalAnswer = speech.transcript.trim() || answerText.trim();
      speech.stopListening();
      setVoiceAnswering(false);
      setAnswerText(finalAnswer);
      await submitCurrentAnswer(finalAnswer, true);
      return;
    }

    setError("");
    setLastScore(null);
    setAnswerText("");
    setVoiceAnswering(true);
    speech.startListening();
  }

  async function handleSubmitAnswer(e) {
    e.preventDefault();
    await submitCurrentAnswer(answerText, false);
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
    <div className="app-shell interview-room-shell">
      <div className="interview-toolbar">
        <div>
          <div className="overview-label">Interview mode</div>
          <div className="toolbar-copy">Simple layout, one question at a time.</div>
        </div>
        <div className="toolbar-actions">
          <span className={`status-pill ${isFullscreen ? "completed" : "in-progress"}`}>
            {isFullscreen ? "Fullscreen active" : "Fullscreen available"}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={isFullscreen ? exitFullscreen : enterFullscreen}>
            {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          </button>
        </div>
      </div>

      <div className="progress-track" style={{ marginTop: 24 }}>
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="interview-stage">
        <div className="interview-headline-row">
          <div>
            <h2 style={{ fontSize: 26, marginBottom: 6 }}>Mock Interview</h2>
            <p className="muted" style={{ margin: 0 }}>
              Question {questionCount} of {MAX_QUESTIONS}
              {speech.isSpeaking && " · AI interviewer is speaking..."}
            </p>
          </div>
          <div className={`mini-avatar ${speech.isSpeaking ? "speaking" : ""}`}>AI</div>
        </div>

        {loadingQ && <p style={{ marginTop: 20 }}>Generating your next question...</p>}

        {!loadingQ && question && <div className="question-box question-box-plain">{question.question}</div>}

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
                <div className="voice-panel">
                  <div className="voice-panel-head">
                    <div>
                      <div className="overview-label">Voice answer</div>
                      <h3 style={{ fontSize: 18, marginTop: 4 }}>Speak naturally and edit before submitting</h3>
                    </div>
                    <span className={`status-pill ${speech.isListening ? "completed" : "in-progress"}`}>
                      {speech.isListening ? "Listening" : "Ready"}
                    </span>
                  </div>

                  <div className="voice-panel-body">
                    <button
                      type="button"
                      className={`mic-btn mic-btn-modern ${speech.isListening ? "listening" : ""}`}
                      onClick={handleVoiceButtonClick}
                      disabled={loadingQ}
                    >
                      <span className="mic-icon" aria-hidden="true">
                        {speech.isListening ? "◼" : "🎤"}
                      </span>
                      <span className="mic-copy">{speech.isListening ? "Stop" : "Start"}</span>
                    </button>

                    <div className="voice-message-stack">
                      <p className="voice-message-title">
                        {speech.isListening ? "Recording your answer now" : "Tap the mic to answer with your voice"}
                      </p>
                      <p className="voice-message-copy">
                        {speech.isListening
                          ? "Your speech is being transcribed live. You can review it before sending."
                          : "Use voice for a smoother mock interview experience, or type below instead."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ textAlign: "left" }}>
                <label className="label">
                  {speech.isSupported ? "Transcript (you can edit before submitting)" : "Your answer"}
                </label>
                <textarea
                  className="answer-box-modern"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Your answer will appear here as you speak, or type it directly..."
                  disabled={loadingQ || speech.isListening}
                />
              </div>

              {!speech.isSupported && (
                <div className="voice-panel voice-panel-text-mode">
                  <div className="voice-message-stack">
                    <p className="voice-message-title">Text answer mode</p>
                    <p className="voice-message-copy">Type your response clearly, then submit it for evaluation.</p>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting || loadingQ}>
                    {submitting ? "Evaluating your answer..." : "Submit answer"}
                  </button>
                </div>
              )}

              {speech.isSupported && (
                <div className="voice-panel-footer">
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting || loadingQ}>
                    {submitting ? "Evaluating your answer..." : "Submit answer"}
                  </button>
                  <div className="voice-panel-hint">You can use the transcript above or overwrite it with your own text.</div>
                </div>
              )}
            </form>
          ) : reachedLimit ? (
            <button className="btn btn-primary btn-block btn-lg" onClick={handleFinish} disabled={finishing}>
              {finishing ? "Generating your scorecard..." : "Finish and view scorecard"}
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
                {finishing ? "Generating your scorecard..." : "Finish and view scorecard"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-primary btn-block" onClick={loadNextQuestion}>
                  Next question
                </button>
                <button className="btn btn-ghost" onClick={handleFinish} disabled={finishing}>
                  {finishing ? "Ending..." : "End interview"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
