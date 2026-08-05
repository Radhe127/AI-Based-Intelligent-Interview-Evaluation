import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getReport } from "../api/client.js";

function clampScore(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return 0;
  return Math.max(0, Math.min(10, number));
}

function formatScore(value) {
  return clampScore(value).toFixed(1);
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function RadarChart({ technical, communication, overall }) {
  const center = 120;
  const radius = 78;
  const axes = [
    { label: "Technical", angle: -Math.PI / 2, value: technical },
    { label: "Communication", angle: (Math.PI * 5) / 6, value: communication },
    { label: "Overall", angle: (Math.PI * 1) / 6, value: overall },
  ];

  const ringLevels = [0.25, 0.5, 0.75, 1];

  function pointFor(value, angle) {
    const distance = (radius * clampScore(value)) / 10;
    return `${center + Math.cos(angle) * distance},${center + Math.sin(angle) * distance}`;
  }

  const polygonPoints = axes.map((axis) => pointFor(axis.value, axis.angle)).join(" ");

  return (
    <div className="radar-wrap">
      <svg viewBox="0 0 240 240" className="radar-chart" role="img" aria-label="Score radar chart">
        {ringLevels.map((level) => (
          <polygon
            key={level}
            points={axes.map((axis) => pointFor(10 * level, axis.angle)).join(" ")}
            className="radar-ring"
          />
        ))}

        {axes.map((axis) => {
          const x = center + Math.cos(axis.angle) * radius;
          const y = center + Math.sin(axis.angle) * radius;
          return <line key={axis.label} x1={center} y1={center} x2={x} y2={y} className="radar-axis" />;
        })}

        <polygon points={polygonPoints} className="radar-area" />

        {axes.map((axis) => {
          const distance = (radius * clampScore(axis.value)) / 10;
          const x = center + Math.cos(axis.angle) * distance;
          const y = center + Math.sin(axis.angle) * distance;
          const labelX = center + Math.cos(axis.angle) * (radius + 22);
          const labelY = center + Math.sin(axis.angle) * (radius + 22);
          return (
            <g key={axis.label}>
              <circle cx={x} cy={y} r="4" className="radar-dot" />
              <text x={labelX} y={labelY} className="radar-label">
                {axis.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TrendChart({ data }) {
  const width = 760;
  const height = 220;
  const padding = 26;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((item, index) => {
    const x = padding + (data.length === 1 ? chartWidth / 2 : (chartWidth * index) / (data.length - 1));
    const y = padding + chartHeight - (clampScore(item.overall) / 10) * chartHeight;
    return { x, y, label: item.label, value: item.overall };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="trend-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-chart" role="img" aria-label="Overall score trend chart">
        {[0, 2.5, 5, 7.5, 10].map((tick) => {
          const y = padding + chartHeight - (tick / 10) * chartHeight;
          return <line key={tick} x1={padding} y1={y} x2={width - padding} y2={y} className="chart-grid-line" />;
        })}

        <polyline points={linePoints} className="trend-line" />

        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" className="trend-dot" />
            <text x={point.x} y={height - 8} textAnchor="middle" className="trend-label">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ComparisonBars({ data }) {
  return (
    <div className="comparison-list">
      {data.map((item, index) => (
        <div className="comparison-row" key={`${item.label}-${index}`}>
          <div className="comparison-label">{item.label}</div>
          <div className="comparison-bars">
            <div className="comparison-bar-track">
              <span className="comparison-bar comparison-bar-technical" style={{ width: `${clampScore(item.technical) * 10}%` }} />
            </div>
            <div className="comparison-bar-track">
              <span className="comparison-bar comparison-bar-communication" style={{ width: `${clampScore(item.communication) * 10}%` }} />
            </div>
            <div className="comparison-bar-track">
              <span className="comparison-bar comparison-bar-overall" style={{ width: `${clampScore(item.overall) * 10}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
  const chartData = (qaRecords || []).map((qa, index) => ({
    label: `Q${index + 1}`,
    technical: qa.technicalScore ?? 0,
    communication: qa.communicationScore ?? 0,
    overall: qa.overallScore ?? 0,
  }));
  const radarData = {
    technical: report?.technicalAvg ?? 0,
    communication: report?.communicationAvg ?? 0,
    overall: report?.averageScore ?? 0,
  };
  const avgPct = Math.round(((report?.averageScore || 0) / 10) * 100);

  return (
    <div className="app-shell scorecard-shell">
      <div className="scorecard-layout">
        <div className="card scorecard-primary">
          <div className="scorecard-hero">
            <p className="muted" style={{ marginBottom: 6 }}>
              {interview?.technology} · {interview?.difficulty} · {qaRecords?.length || 0} questions
            </p>
            <h2 style={{ fontSize: 24, marginBottom: 22 }}>Your Interview Scorecard</h2>

            <div className="scorecard-ring" style={{ "--pct": avgPct }}>
              <div className="ring-val">{formatScore(report?.averageScore || 0)}</div>
            </div>
            <p className="muted">Overall Score out of 10</p>
          </div>

          <div className="metric-row">
            <div className="metric-tile">
              <div className="v">{formatScore(report?.technicalAvg || 0)}</div>
              <div className="l">Technical</div>
            </div>
            <div className="metric-tile">
              <div className="v">{formatScore(report?.communicationAvg || 0)}</div>
              <div className="l">Communication</div>
            </div>
            <div className="metric-tile">
              <div className="v">{formatScore(report?.averageScore || 0)}</div>
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

        <div className="chart-stack">
          <ChartCard title="Performance radar" subtitle="How the three core score dimensions compare at a glance.">
            <RadarChart {...radarData} />
          </ChartCard>

          <ChartCard title="Overall score trend" subtitle="Question-by-question movement across the interview.">
            <TrendChart data={chartData} />
          </ChartCard>

          <ChartCard title="Question comparison" subtitle="Technical, communication, and overall scores for every answer.">
            <ComparisonBars data={chartData} />
          </ChartCard>
        </div>
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
                  <div className="val">{formatScore(qa.technicalScore)}</div>
                  <div className="lab">Technical</div>
                </div>
                <div className="score-pill">
                  <div className="val">{formatScore(qa.communicationScore)}</div>
                  <div className="lab">Communication</div>
                </div>
                <div className="score-pill">
                  <div className="val">{formatScore(qa.overallScore)}</div>
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
