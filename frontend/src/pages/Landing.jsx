import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURES = [
  {
    icon: "📄",
    bg: "linear-gradient(135deg, #9cc9bf, #d9c6a5)",
    title: "Resume Clarity",
    desc: "Turn a resume into a clean interview snapshot with strengths, focus areas, and a role fit that is easy to act on.",
  },
  {
    icon: "🎙️",
    bg: "linear-gradient(135deg, #b8d7e2, #9cc9bf)",
    title: "Calm Live Practice",
    desc: "Speak naturally or type your answer. The interviewer keeps the flow steady, so practice feels focused rather than stressful.",
  },
  {
    icon: "🧠",
    bg: "linear-gradient(135deg, #d9c6a5, #b8d7e2)",
    title: "Thoughtful Questioning",
    desc: "Questions adapt to the role, experience, and evidence in the resume, so every round feels relevant and human.",
  },
  {
    icon: "📊",
    bg: "linear-gradient(135deg, #9fc7a7, #b8d7e2)",
    title: "Useful Scorecards",
    desc: "See what was clear, what was missing, and what to improve next so feedback feels practical instead of generic.",
  },
  {
    icon: "🎯",
    bg: "linear-gradient(135deg, #cfc4e6, #9fc7a7)",
    title: "Alignment That Helps",
    desc: "Compare resume claims with live performance and spot the exact gap that deserves attention before the real interview.",
  },
  {
    icon: "🚀",
    bg: "linear-gradient(135deg, #b8d7e2, #d9c6a5)",
    title: "Next-Step Guidance",
    desc: "Every report ends with clear practice prompts that help a candidate improve quickly and confidently.",
  },
];

const STEPS = [
  { num: "01", title: "Create your profile", desc: "Share your target role and the kind of interview you want to practice." },
  { num: "02", title: "Upload your resume", desc: "The scan turns your background into a simple preparation summary." },
  { num: "03", title: "Practice live", desc: "Work through questions in voice or text with a steady interview flow." },
  { num: "04", title: "Review your next steps", desc: "Leave with strengths, gaps, and focused practice ideas." },
];

const TAKEAWAYS = [
  {
    title: "What the interviewer looks for",
    text: "Clarity, relevance, and the ability to connect experience to the role.",
  },
  {
    title: "How feedback is framed",
    text: "Every scorecard points to concrete improvements, not vague criticism.",
  },
  {
    title: "Why it feels useful",
    text: "Short, focused rounds build confidence faster than long, noisy mock sessions.",
  },
];

const TOPICS = ["Resume review", "Behavioral answers", "Technical depth", "Communication", "Confidence", "Next steps"];

const PRODUCT_HIGHLIGHTS = [
  { label: "Profile tuned", value: "Role + skills" },
  { label: "Interview mode", value: "Voice / text" },
  { label: "Feedback depth", value: "Question level" },
  { label: "Scorecards", value: "Charts + insights" },
];

const PREVIEW_STEPS = [
  "Upload a resume and set your target role.",
  "Get a live mock interview with adaptive questions.",
  "Review a scorecard with charts, strengths, and gaps.",
];

export default function Landing() {
  const { user } = useAuth();
  const primaryHref = user ? "/dashboard" : "/signup";

  return (
    <div className="shell landing-shell">
      <section className="hero hero-split">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="pulse-dot" />
            Modern AI mock interview platform
          </span>

          <h1>
            Interview practice that feels <span className="grad-text">smart</span>,
            polished, and worth coming back to
          </h1>

          <p className="lead">
            Scan a resume, personalize the role, run a focused mock interview, and
            finish with charts, scorecards, and next steps that are actually useful.
          </p>

          <div className="hero-actions">
            <Link to={primaryHref} className="btn btn-primary btn-lg">
              Start practicing
            </Link>
            <a href="#how-it-works" className="btn btn-ghost btn-lg">
              Explore the flow
            </a>
          </div>

          <div className="hero-meta-row">
            {PRODUCT_HIGHLIGHTS.map((item) => (
              <div className="hero-meta-card" key={item.label}>
                <div className="hero-meta-label">{item.label}</div>
                <div className="hero-meta-value">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="hero-note-stack">
            <p className="hero-note">Voice or text mode - fullscreen interview focus - rich score visualization</p>
            <div className="hero-tag-row">
              <span className="topic-pill">Resume intelligence</span>
              <span className="topic-pill">Adaptive questions</span>
              <span className="topic-pill">Analytics dashboard</span>
            </div>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-orb preview-orb-a" />
          <div className="preview-orb preview-orb-b" />

          <div className="preview-card preview-card-main">
            <div className="preview-card-head">
              <div>
                <div className="overview-label">Live session preview</div>
                <h3>Interview OS</h3>
              </div>
              <span className="status-pill completed">Active</span>
            </div>

            <div className="preview-score-grid">
              <div className="preview-score-tile">
                <span className="preview-score-value">92</span>
                <span className="preview-score-label">Profile fit</span>
              </div>
              <div className="preview-score-tile">
                <span className="preview-score-value">08</span>
                <span className="preview-score-label">Focus areas</span>
              </div>
              <div className="preview-score-tile">
                <span className="preview-score-value">10</span>
                <span className="preview-score-label">Questions</span>
              </div>
            </div>

            <div className="preview-timeline">
              {PREVIEW_STEPS.map((step, index) => (
                <div className="preview-step" key={step}>
                  <div className="preview-step-dot">{index + 1}</div>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="preview-card preview-card-compact">
            <div className="overview-label">Today's output</div>
            <div className="preview-bullet-list">
              <div>Cleaner answers</div>
              <div>Better role targeting</div>
              <div>Charts for growth</div>
            </div>
          </div>
        </div>
      </section>

      <div className="insight-strip insight-strip-modern">
        <div className="insight-item insight-item-strong">
          <div className="lab">Strong signals</div>
          <div className="copy">Highlights the strengths that deserve to be said with confidence.</div>
        </div>
        <div className="insight-item">
          <div className="lab">Clear focus</div>
          <div className="copy">Shows the 1-2 answers that would raise the biggest interview quality gain.</div>
        </div>
        <div className="insight-item">
          <div className="lab">Role fit</div>
          <div className="copy">Connects the resume to the most suitable interview path before practice begins.</div>
        </div>
        <div className="insight-item">
          <div className="lab">Next step</div>
          <div className="copy">Ends with a short plan that helps a candidate improve with purpose.</div>
        </div>
      </div>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-head">
          <h2>Everything useful in one polished product flow</h2>
          <p>From the resume scan to the final scorecard, every step is focused on clarity, confidence, and practical improvement.</p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>What you actually get from each session</h2>
          <p>Not just a score, but a set of signals, charts, and next steps that make progress easier to see.</p>
        </div>

        <div className="takeaway-grid">
          {TAKEAWAYS.map((item) => (
            <div className="takeaway-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>

        <div className="topic-band">
          {TOPICS.map((topic) => (
            <span className="topic-pill" key={topic}>
              {topic}
            </span>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>A cleaner dashboard for modern interview prep</h2>
          <p>Profile insights, resume signals, and interview history are arranged to feel denser, richer, and easier to scan.</p>
        </div>

        <div className="feature-grid feature-grid-compact">
          <div className="feature-card feature-card-spotlight">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #6f948f, #b28b5f)" }}>✨</div>
            <h3>Profile intelligence</h3>
            <p>See role fit, skills, experience, and practice history in one view.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #b8d7e2, #9cc9bf)" }}>📈</div>
            <h3>Charts and score trends</h3>
            <p>Radar, trend, and comparison charts make performance easy to interpret.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ background: "linear-gradient(135deg, #d9c6a5, #b8d7e2)" }}>⚡</div>
            <h3>Faster interview flow</h3>
            <p>Fullscreen mode and a focused interview room keep the candidate locked in.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works">
        <div className="section-head">
          <h2>From profile to progress in four steps</h2>
          <p>A simple flow that helps a candidate practice with structure instead of pressure.</p>
        </div>

        <div className="steps-grid">
          {STEPS.map((s) => (
            <div className="step-card" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Ready to practice inside a more modern interview experience?</h2>
        <p>Upload your resume and get a focused interview session that shows what to keep, what to improve, and what to say next.</p>
        <Link to={primaryHref} className="btn btn-primary btn-lg">
          Start now
        </Link>
      </div>

      <footer className="footer">
        Interview · Practice with clarity
      </footer>
    </div>
  );
}
