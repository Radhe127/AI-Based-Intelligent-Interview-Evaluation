import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signup({ name, email, password, targetRole });
      loginSuccess(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="narrow-shell">
      <div className="auth-card">
        <h2>Create your profile</h2>
        <p className="sub">Step 1 of your interview practice journey — it only takes a minute.</p>

        <form onSubmit={handleSubmit}>
          <label className="label">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label className="label">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label className="label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <label className="label">Target role</label>
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
            <option>Software Engineer</option>
            <option>Backend Developer</option>
            <option>Frontend Developer</option>
            <option>Full Stack Developer</option>
            <option>Data Analyst</option>
            <option>Other</option>
          </select>

          {error && <div className="error-box">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="divider-text">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#c4b5fd", fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
