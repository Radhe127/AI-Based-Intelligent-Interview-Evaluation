import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { uploadResume, fetchLatestResume, listInterviews } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function ProfileChart({ name, targetRole, experience, skillsCount, resumeScore, interviewCount }) {
  const bars = [
    { label: "Role fit", value: targetRole ? 85 : 45 },
    { label: "Experience", value: experience && experience !== "Fresher" ? 78 : 52 },
    { label: "Skills", value: Math.min(100, skillsCount * 12) },
    { label: "Resume", value: resumeScore ? Math.min(100, resumeScore) : 40 },
    { label: "Practice", value: Math.min(100, interviewCount * 14) },
  ];

  return (
    <div className="profile-chart-card card">
      <div className="overview-label">Profile snapshot</div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
        <h3 style={{ fontSize: 20 }}>{name || "Your profile"}</h3>
        <span className="status-pill completed">Profile focus</span>
      </div>
      <p className="muted" style={{ marginBottom: 16 }}>
        A quick view of how complete and interview-ready your profile looks.
      </p>

      <div className="profile-bars">
        {bars.map((bar) => (
          <div className="profile-bar-row" key={bar.label}>
            <div className="profile-bar-label">{bar.label}</div>
            <div className="profile-bar-track">
              <span className="profile-bar-fill" style={{ width: `${bar.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="profile-chart-footer">
        <span>{targetRole || "No target role set"}</span>
        <span>{skillsCount} skills</span>
        <span>{interviewCount} interviews</span>
      </div>
    </div>
  );
}

function ScoreBadge({ label, value }) {
  const score = value ?? 0;
  const color = score >= 7 ? "var(--color-success, #2d9e6b)" : score >= 5 ? "var(--color-warn, #d97706)" : "var(--color-danger, #dc2626)";
  return (
    <div style={{ textAlign: "center", minWidth: 60 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color }}>{score.toFixed(1)}</div>
      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [interviews, setInterviews] = useState([]);
  const latestInterview = interviews[0];
  const interviewLanguage = latestInterview?.mode === "voice" ? "English, spoken" : "English, typed";
  const completedInterviews = interviews.filter((item) => item.status === "completed").length;
  const activeInterviews = interviews.filter((item) => item.status !== "completed").length;
  const resumeSkillCount = resume?.extractedSkills?.length || 0;
  const resumeStrengthCount = resume?.resumeStrengths?.length || 0;
  const resumeImproveCount = resume?.resumeImprovements?.length || 0;
  const interviewFocus = latestInterview?.technology || resume?.suggestedDomain || user?.targetRole || "Interview readiness";

  useEffect(() => {
    fetchLatestResume()
      .then((res) => setResume(res.data.resume))
      .catch(() => setResume(null))
      .finally(() => setResumeLoading(false));

    listInterviews()
      .then((res) => setInterviews(res.data.interviews))
      .catch(() => {});
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await uploadResume(formData);
      setResume(res.data.resume);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to scan resume");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="app-shell dashboard-shell">
      <div className="dash-header">
        <div className="dash-greeting">
          <h2>Welcome back, {user?.name?.split(" ")[0]}</h2>
          <p>Here's your interview snapshot, resume signals, and practice history.</p>
        </div>
        <Link to="/setup" className="btn btn-primary">
          + New Interview
        </Link>
      </div>

      <div className="overview-grid">
        <div className="overview-card overview-card-strong">
          <div className="overview-label">Interview overview</div>
          <h3>{latestInterview ? latestInterview.technology : "Your next interview"}</h3>
          <p>
            {latestInterview
              ? `You last practiced in ${interviewLanguage} mode at ${latestInterview.difficulty} difficulty.`
              : "Choose a domain, mode, and difficulty to shape the next session."}
          </p>
        </div>

        <div className="overview-card">
          <div className="overview-label">Language</div>
          <div className="overview-value">English</div>
          <p>Keep answers simple and direct so the interviewer can focus on what you know.</p>
        </div>

        <div className="overview-card">
          <div className="overview-label">Preferred mode</div>
          <div className="overview-value">{latestInterview?.mode || "voice"}</div>
          <p>{latestInterview?.mode === "text" ? "Useful for careful practice." : "Useful for live speaking practice."}</p>
        </div>

        <div className="overview-card">
          <div className="overview-label">Target role</div>
          <div className="overview-value">{user?.targetRole || "Interview-ready"}</div>
          <p>Keep your examples aligned with the role you want next.</p>
        </div>
      </div>

      <div className="section-head dashboard-section-head">
        <h2>Your interview profile</h2>
        <p>These details shape the conversation the AI interviewer will follow.</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card profile-card-highlight">
          <div className="overview-label">Interview role</div>
          <h3>{interviewFocus}</h3>
          <p>
            The interviewer will lean on this role to choose the question style, technical depth, and expected answer shape.
          </p>
        </div>

        <div className="profile-card">
          <div className="overview-label">Format</div>
          <div className="profile-value">{latestInterview?.mode || "voice"}</div>
          <p>{latestInterview?.mode === "text" ? "Typing mode keeps answers structured." : "Voice mode keeps practice close to the real thing."}</p>
        </div>

        <div className="profile-card">
          <div className="overview-label">Difficulty</div>
          <div className="profile-value">{latestInterview?.difficulty || "Intermediate"}</div>
          <p>Higher difficulty means more follow-up questions and tighter evaluation.</p>
        </div>

        <div className="profile-card">
          <div className="overview-label">Interview language</div>
          <div className="profile-value">{interviewLanguage}</div>
          <p>Clear, concise language keeps the flow calm and easy to follow.</p>
        </div>

        <div className="profile-card">
          <div className="overview-label">Resume skills</div>
          <div className="profile-value">{resumeSkillCount}</div>
          <p>{resumeSkillCount ? "These keywords help tailor the interview questions." : "Upload a resume to unlock role matching."}</p>
        </div>

        <div className="profile-card">
          <div className="overview-label">Practice history</div>
          <div className="profile-value">{interviews.length}</div>
          <p>{completedInterviews} completed · {activeInterviews} active</p>
        </div>
      </div>

      <ProfileChart
        name={user?.name}
        targetRole={user?.targetRole}
        experience={user?.experience}
        skillsCount={user?.skills?.length || 0}
        resumeScore={resume?.atsScore || 0}
        interviewCount={interviews.length}
      />

      {/* Resume card */}
      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Resume Snapshot</h3>
        <p className="muted" style={{ marginBottom: 18 }}>
          The latest scan highlights what to emphasize, what to sharpen, and where your profile looks strongest.
        </p>

        {error && <div className="error-box">{error}</div>}

        {resumeLoading ? (
          <p className="muted">Loading resume...</p>
        ) : resume ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span className="scan-badge">✓ Resume scanned · {resume.fileName}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()}>
                {uploading ? "Scanning..." : "Re-upload"}
              </button>
            </div>

            <div className="metric-row">
              <div className="metric-tile">
                <div className="v">{resume.atsScore}</div>
                <div className="l">Signal score</div>
              </div>
              <div className="metric-tile">
                <div className="v">{resume.extractedExperienceLevel}</div>
                <div className="l">Experience level</div>
              </div>
              <div className="metric-tile">
                <div className="v">{resume.suggestedDomain}</div>
                <div className="l">Best-fit track</div>
              </div>
            </div>

            <div className="profile-inline-grid">
              <div className="profile-inline-card">
                <div className="overview-label">Strengths</div>
                <div className="profile-value">{resumeStrengthCount}</div>
                <p>Signals already working in your favor.</p>
              </div>
              <div className="profile-inline-card">
                <div className="overview-label">Improvement areas</div>
                <div className="profile-value">{resumeImproveCount}</div>
                <p>Places where a stronger example would help.</p>
              </div>
              <div className="profile-inline-card">
                <div className="overview-label">Skills extracted</div>
                <div className="profile-value">{resumeSkillCount}</div>
                <p>Keywords that drive interview tailoring.</p>
              </div>
            </div>

            <p style={{ fontSize: 14, color: "var(--text-dim)", margin: "14px 0" }}>{resume.summary}</p>

            <div className="fb-grid" style={{ marginTop: 10 }}>
              <div>
                <h4 style={{ fontSize: 14, marginBottom: 10 }}>What stands out</h4>
                <ul className="fb-list good">
                  {resume.resumeStrengths?.length ? (
                    resume.resumeStrengths.map((item, index) => <li key={index}>{item}</li>)
                  ) : (
                    <li>Clear foundational skills and resume signals</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 style={{ fontSize: 14, marginBottom: 10 }}>What to sharpen</h4>
                <ul className="fb-list improve">
                  {resume.resumeImprovements?.length ? (
                    resume.resumeImprovements.map((item, index) => <li key={index}>{item}</li>)
                  ) : (
                    <li>Add stronger examples and measurable impact</li>
                  )}
                </ul>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              {resume.extractedSkills?.map((s) => (
                <span className="skill-chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="resume-dropzone" onClick={() => fileInputRef.current?.click()}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>
              {uploading ? "Scanning your resume..." : "Click to upload your resume"}
            </p>
            <p className="muted">Text-based PDF or TXT, up to 5MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* Interview history */}
      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Interview History</h3>
        <p className="muted" style={{ marginBottom: 14 }}>
          Revisit past scorecards or continue where you left off.
        </p>

        {interviews.length === 0 ? (
          <p className="muted">No interviews yet. Start your first one above.</p>
        ) : (
          interviews.map((iv) => (
            <div className="history-row" key={iv._id} style={{ flexWrap: "wrap", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <strong>{iv.technology}</strong>{" "}
                <span className="muted">· {iv.difficulty} · {iv.mode}</span>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {new Date(iv.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>

              {iv.status === "completed" && iv.averageScore !== null && iv.averageScore !== undefined ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <ScoreBadge label="Overall" value={iv.averageScore} />
                  <ScoreBadge label="Technical" value={iv.technicalAvg} />
                  <ScoreBadge label="Communication" value={iv.communicationAvg} />
                </div>
              ) : null}

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className={`status-pill ${iv.status === "completed" ? "completed" : "in-progress"}`}>
                  {iv.status}
                </span>
                {iv.status === "completed" ? (
                  <Link to={`/report/${iv._id}`} className="btn btn-ghost btn-sm">
                    View Report
                  </Link>
                ) : (
                  <Link to={`/interview/${iv._id}`} className="btn btn-ghost btn-sm">
                    Resume
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card interview-note-card">
        <div className="overview-label">Interviewer details</div>
        <h3 style={{ marginBottom: 10 }}>How the session will feel</h3>
        <div className="fb-grid">
          <div>
            <div className="interview-detail-card">
              <div className="detail-title">Question style</div>
              <p>Direct first, then deeper follow-ups based on what you say and what appears in the resume.</p>
            </div>
            <div className="interview-detail-card">
              <div className="detail-title">Evaluation focus</div>
              <p>Technical understanding, communication clarity, and how well your answer matches the role.</p>
            </div>
          </div>
          <div>
            <div className="interview-detail-card">
              <div className="detail-title">Best way to answer</div>
              <p>Keep it short, mention one example, and end with the impact or result.</p>
            </div>
            <div className="interview-detail-card">
              <div className="detail-title">What helps most</div>
              <p>Clear language, concrete numbers, and a calm pace when you speak.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
