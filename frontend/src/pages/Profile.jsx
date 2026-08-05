import React, { useEffect, useState } from "react";
import { fetchMe, updateProfile } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const EXPERIENCE_OPTIONS = ["Fresher", "0-2 years", "3-5 years", "5+ years"];

function splitSkills(value) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    targetRole: "",
    experience: "Fresher",
    skillsText: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const currentUser = user || (await fetchMe()).data.user;
        if (!isMounted) return;
        setUser(currentUser);
        setForm({
          name: currentUser.name || "",
          phone: currentUser.phone || "",
          targetRole: currentUser.targetRole || "",
          experience: currentUser.experience || "Fresher",
          skillsText: Array.isArray(currentUser.skills) ? currentUser.skills.join(", ") : "",
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [setUser, user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        targetRole: form.targetRole,
        experience: form.experience,
        skills: splitSkills(form.skillsText),
      };
      const res = await updateProfile(payload);
      setUser(res.data.user);
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  const skills = splitSkills(form.skillsText);

  return (
    <div className="app-shell profile-shell">
      <div className="section-head dashboard-section-head" style={{ marginTop: 18 }}>
        <h2>Your profile</h2>
        <p>Keep your details current so the AI interviewer can tailor the session to you.</p>
      </div>

      <div className="profile-page-grid">
        <form className="card profile-form-card" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: 6 }}>Edit details</h3>
          <p className="muted" style={{ marginBottom: 18 }}>
            Update your public profile, interview target role, and the skills you want the interviewer to emphasize.
          </p>

          {message && <div className="success-box">{message}</div>}
          {error && <div className="error-box">{error}</div>}

          <label className="label">Full name</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />

          <label className="label">Email</label>
          <input value={user?.email || ""} readOnly disabled />

          <div className="profile-inline-grid profile-inline-grid-tight">
            <div>
              <label className="label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Mobile number" />
            </div>
            <div>
              <label className="label">Experience</label>
              <select name="experience" value={form.experience} onChange={handleChange}>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="label">Target role</label>
          <input
            name="targetRole"
            value={form.targetRole}
            onChange={handleChange}
            placeholder="Software Engineer, Backend Developer, and so on"
          />

          <label className="label">Skills</label>
          <textarea
            name="skillsText"
            value={form.skillsText}
            onChange={handleChange}
            placeholder="React, Node.js, SQL, system design"
            style={{ minHeight: 110 }}
          />

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="submit" className="btn btn-primary" disabled={saving || loading}>
              {saving ? "Saving profile..." : "Save profile"}
            </button>
            <span className="muted">{skills.length} skill tags prepared for interview matching.</span>
          </div>
        </form>

        <div className="profile-side-stack">
          <div className="card profile-summary-card">
            <div className="overview-label">Profile summary</div>
            <h3>{form.name || user?.name || "Your profile"}</h3>
            <p className="muted" style={{ marginTop: 6 }}>
              This is the identity the interviewer uses when it adapts the session flow and feedback.
            </p>

            <div className="profile-summary-grid">
              <div>
                <div className="profile-summary-value">{form.targetRole || "Unset"}</div>
                <div className="profile-summary-label">Target role</div>
              </div>
              <div>
                <div className="profile-summary-value">{form.experience}</div>
                <div className="profile-summary-label">Experience</div>
              </div>
              <div>
                <div className="profile-summary-value">{skills.length}</div>
                <div className="profile-summary-label">Skill tags</div>
              </div>
            </div>

            <div className="topic-band">
              {skills.length ? (
                skills.map((skill) => (
                  <span className="topic-pill" key={skill}>
                    {skill}
                  </span>
                ))
              ) : (
                <span className="topic-pill">Add skills to personalize the interview</span>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 10 }}>What this changes</h3>
            <div className="interview-detail-card">
              <div className="detail-title">Question targeting</div>
              <p>The AI uses your role and skills to choose more relevant technical prompts.</p>
            </div>
            <div className="interview-detail-card">
              <div className="detail-title">Feedback context</div>
              <p>Your profile helps shape the final scorecard and the improvement suggestions.</p>
            </div>
            <div className="interview-detail-card">
              <div className="detail-title">Practice history</div>
              <p>Updated details apply to future interviews without changing past reports.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}