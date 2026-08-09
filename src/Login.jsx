import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "./assets/logo.png";
import "./Login.css";

// ---------------------------------------------------------------------------
// Top navigation bar
// ---------------------------------------------------------------------------

function TopNav() {
  return (
    <header className="login-nav">
      <div className="login-nav-brand">
        <img src={logo} alt="GasTrack" className="login-nav-logo" />
      </div>
      <nav className="login-nav-links">
        <a href="#home" className="login-nav-link active">Home</a>
        <a href="#about" className="login-nav-link">About</a>
        <a href="#contact" className="login-nav-link">Contact</a>
      </nav>
      <button type="button" className="login-nav-cta">Register LPG Company</button>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Main Login component
//
// Props:
// - onLogin: ({ username, password }) => void   called after basic validation
//   passes; wire this up to your real auth call.
// ---------------------------------------------------------------------------

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      // Replace with your real authentication call, e.g.:
      // const res = await fetch("/api/auth/login", { method: "POST", ... });
      if (onLogin) {
        await onLogin({ username, password });
      }
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    // Hook this up to your forgot-password flow / route
    console.log("Forgot password clicked");
  };

  return (
    <div className="login-page">
      <TopNav />

      <div className="login-content">
        <div className="login-card">
          <div className="login-card-logo">
            <img src={logo} alt="GasTrack" className="login-card-logo-img" />
          </div>

          <p className="login-welcome">Welcome to GasTrack!</p>
          <p className="login-subtitle">Login to your account</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />

            <div className="login-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="button" className="login-forgot" onClick={handleForgotPassword}>
              Forgot your password?
            </button>

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}