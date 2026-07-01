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

export default function Landing() {
  const { user } = useAuth();
  const primaryHref = user ? "/dashboard" : "/signup";

  return (
    <div className="shell">
      {/* Hero */}
      <section className="hero">
        <div className="eyebrow">
          <span className="pulse-dot" />
          Calm practice for confident interviews
        </div>

        <h1>
          Interview practice that feels <span className="grad-text">clear</span>,
          calm, and genuinely useful
        </h1>

        <p className="lead">
          Interview scans your resume, turns it into a guided practice plan,
          and runs a focused mock interview that shows what to say, what to
          strengthen, and what already makes you stand out.
        </p>

        <div className="hero-actions">
          <Link to={primaryHref} className="btn btn-primary btn-lg">
            Start practicing →
          </Link>
          <a href="#how-it-works" className="btn btn-ghost btn-lg">
            See how it works
          </a>
        </div>
        <p className="hero-note">Voice or text mode · quick setup · supportive feedback</p>

        <div className="insight-strip">
          <div className="insight-item">
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
            <div className="copy">Ends with a short plan that helps a candidate improve with purpose.
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-head">
          <h2>Everything useful in one calm flow</h2>
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
          <p>Not just a score, but helpful context that makes interview practice more intentional.</p>
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

      {/* How it works */}
      <section className="section" id="how-it-works">
        <div className="section-head">
          <h2>From profile to progress in four steps</h2>
          <p>A simple flow that helps an interviewer practice with structure instead of pressure.</p>
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
        <h2>Ready to practice with more clarity?</h2>
        <p>Upload your resume and get a focused interview session that shows what to keep, what to improve, and what to say next.
        </p>
        <Link to={primaryHref} className="btn btn-primary btn-lg">
          Start now →
        </Link>
      </div>

      <footer className="footer">
        Interview · Practice with clarity
      </footer>
    </div>
  );
}
