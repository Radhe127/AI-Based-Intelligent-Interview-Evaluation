import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getReport } from "../api/client.js";

export default function Scorecard() {
  const { interviewId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getReport(interviewId)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load report"));
  }, [interviewId]);

  if (error) return <div className="app-shell" style={{ paddingTop: 30 }}><div className="error-box">{error}</div></div>;
  if (!data) return <div className="app-shell" style={{ paddingTop: 30 }}><p className="muted">Loading scorecard...</p></div>;

  const { interview, report, qaRecords } = data;
  const pct = Math.round(((report?.averageScore || 0) / 10) * 100);

  return (
    <div className="app-shell">
      <div className="card">
        <div className="scorecard-hero">
          <p className="muted" style={{ marginBottom: 6 }}>
            {interview?.technology} · {interview?.difficulty} · {qaRecords?.length || 0} questions
          </p>
          <h2 style={{ fontSize: 24, marginBottom: 22 }}>Your Interview Scorecard</h2>

          <div className="scorecard-ring" style={{ "--pct": pct }}>
            <div className="ring-val">{report?.averageScore ?? 0}</div>
          </div>
          <p className="muted">Overall Score out of 10</p>
        </div>

        <div className="metric-row">
          <div className="metric-tile">
            <div className="v">{report?.technicalAvg ?? 0}</div>
            <div className="l">Technical</div>
          </div>
          <div className="metric-tile">
            <div className="v">{report?.communicationAvg ?? 0}</div>
            <div className="l">Communication</div>
          </div>
          <div className="metric-tile">
            <div className="v">{report?.averageScore ?? 0}</div>
            <div className="l">Overall</div>
          </div>
        </div>

        {report?.summary && (
          <p style={{ fontSize: 15, lineHeight: 1.6, margin: "18px 0" }}>{report.summary}</p>
        )}

        {report?.resumeAlignment && (
          <div className="card" style={{ background: "var(--bg-soft)", marginBottom: 0 }}>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>Resume vs. Live Performance</h4>
            <p className="muted" style={{ fontSize: 13.5 }}>{report.resumeAlignment}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="fb-grid">
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Strengths</h3>
            <ul className="fb-list good">
              {report?.strengths?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Areas to Improve</h3>
            <ul className="fb-list improve">
              {report?.improvements?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {report?.recommendedNextSteps?.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Recommended Next Steps</h3>
          <ul className="fb-list good">
            {report.recommendedNextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Question-by-Question Transcript</h3>
        {qaRecords?.map((qa, i) => (
          <div className="qa-record" key={i}>
            <div className="q">Q{i + 1}. {qa.question}</div>
            <div className="a">{qa.answer || "No answer recorded"}</div>
            {qa.overallScore !== null && (
              <div className="score-row" style={{ margin: "10px 0 0" }}>
                <div className="score-pill">
                  <div className="val">{qa.technicalScore}</div>
                  <div className="lab">Technical</div>
                </div>
                <div className="score-pill">
                  <div className="val">{qa.communicationScore}</div>
                  <div className="lab">Communication</div>
                </div>
                <div className="score-pill">
                  <div className="val">{qa.overallScore}</div>
                  <div className="lab">Overall</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 60 }}>
        <Link to="/setup" className="btn btn-primary">
          Take Another Interview
        </Link>
        <Link to="/dashboard" className="btn btn-ghost">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
