import React, { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import navLogo from "./assets/logo-login.png";
import cardLogo from "./assets/logo-card.png";
import "./Login.css";

function TopNav() {
  return (
    <header className="login-nav">
      <div className="login-nav-brand">
        <img src={navLogo} alt="GasTrack Logo" className="login-nav-logo" />
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
      if (onLogin) {
        await onLogin({ username, password });
      }
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <TopNav />

      <main className="login-content">
        <div className="login-card">
          {/* Fixed variable reference below */}
          <img src={cardLogo} alt="GasTrack" className="login-card-logo-img" />

          <h2 className="login-welcome">Welcome to GasTrack!</h2>
          <p className="login-subtitle">Login to your account</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Username Input Group */}
            <div className="input-field-group">
              <User size={18} className="field-icon" />
              <input
                type="text"
                placeholder="Username"
                className="login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            {/* Password Input Group */}
            <div className="input-field-group">
              <Lock size={18} className="field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="login-input has-toggle"
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

            <div className="forgot-wrap">
              <button type="button" className="login-forgot">
                Forgot your password?
              </button>
            </div>

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}