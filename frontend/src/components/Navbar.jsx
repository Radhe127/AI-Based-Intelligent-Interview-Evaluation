import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="shell">
      <div className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark-core">I</span>
            <span className="brand-mark-dot" />
          </span>
          Interview
        </Link>

        <div className="nav-links">
          <a href="/#features">Features</a>
          <a href="/#how-it-works">How it works</a>
        </div>

        <div className="nav-cta">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
              <button className="btn btn-danger-ghost btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
