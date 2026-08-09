import React, { useState } from "react";
import { Eye, EyeOff, User, Lock, Phone, Mail, Clock, ChevronDown } from "lucide-react";
import navLogo from "./assets/logo-login.png";
import cardLogo from "./assets/logo.png";
import "./Login.css";

function TopNav({ currentView, setCurrentView }) {
  return (
    <header className="login-nav">
      <div 
        className="login-nav-brand" 
        onClick={() => setCurrentView("login")} 
        style={{ cursor: "pointer" }}
      >
        <img src={navLogo} alt="GasTrack Logo" className="login-nav-logo" />
      </div>
      <nav className="login-nav-links">
        <button 
          type="button" 
          className={`login-nav-link ${currentView === "login" ? "active" : ""}`}
          onClick={() => setCurrentView("login")}
        >
          Home
        </button>
        <button 
          type="button" 
          className={`login-nav-link ${currentView === "about" ? "active" : ""}`}
          onClick={() => setCurrentView("about")}
        >
          About
        </button>
        <button 
          type="button" 
          className={`login-nav-link ${currentView === "contact" ? "active" : ""}`}
          onClick={() => setCurrentView("contact")}
        >
          Contact
        </button>
      </nav>
      {currentView === "register" ? (
        <button 
          type="button" 
          className="login-nav-cta secondary" 
          onClick={() => setCurrentView("login")}
        >
          Back to Login
        </button>
      ) : (
        <button 
          type="button" 
          className="login-nav-cta" 
          onClick={() => setCurrentView("register")}
        >
          Register LPG Company
        </button>
      )}
    </header>
  );
}

export default function Login({ onLogin }) {
  // Navigation State: 'login' | 'register' | 'about' | 'contact'
  const [currentView, setCurrentView] = useState("login");

  // Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    companyName: "",
    dtiSecNo: "",
    doeLicenseNo: "",
    branchName: "",
    cityMunicipality: "",
    completeAddress: "",
    firstName: "",
    lastName: "",
    email: "",
    regPassword: "",
    confirmPassword: "",
    termsAgreed: false,
  });

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleLoginSubmit = async (e) => {
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

  const handleRegChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegSubmit = (e) => {
    e.preventDefault();
    if (!regForm.termsAgreed) {
      alert("Please confirm the terms and conditions before submitting.");
      return;
    }
    alert("Registration submitted successfully!");
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert("Thank you! Your message has been sent.");
    setContactForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="login-page">
      <TopNav currentView={currentView} setCurrentView={setCurrentView} />

      <main className="login-content">
        {/* LOGIN VIEW */}
        {currentView === "login" && (
          <div className="login-card">
            <img src={cardLogo} alt="GasTrack" className="login-card-logo-img" />
            <h2 className="login-welcome">Welcome to GasTrack!</h2>
            <p className="login-subtitle">Login to your account</p>

            <form className="login-form" onSubmit={handleLoginSubmit}>
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
        )}

        {/* REGISTER VIEW */}
        {currentView === "register" && (
          <div className="register-layout-container">
            <div className="register-sidebar-col">
              <div className="register-stepper-card">
                <h2 className="register-stepper-title">
                  Register your LPG<br />Company
                </h2>
                <div className="register-stepper-divider"></div>
                <p className="register-stepper-desc">
                  Join GasTrack to digitize your inventory management and gain real-time visibility across all your branches.
                </p>

                <div className="stepper-list">
                  <div className="stepper-step">
                    <div className="stepper-badge active">1</div>
                    <div className="stepper-step-info">
                      <strong>Company details</strong>
                      <span>Fill in your registered business information.</span>
                    </div>
                  </div>
                  <div className="stepper-step">
                    <div className="stepper-badge">2</div>
                    <div className="stepper-step-info">
                      <strong>Admin account</strong>
                      <span>Create the primary administrator login.</span>
                    </div>
                  </div>
                  <div className="stepper-step">
                    <div className="stepper-badge">3</div>
                    <div className="stepper-step-info">
                      <strong>Review and submit</strong>
                      <span>Create the primary administrator login.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="register-reqs-card">
                <h3 className="register-reqs-title">Requirements</h3>
                <ul className="register-reqs-list">
                  <li>DTI / SEC business registration</li>
                  <li>BIR Certificate of Registration</li>
                  <li>DOE LPG dealer license</li>
                  <li>Valid government-issued ID (authorized representative)</li>
                  <li>Active company email address</li>
                </ul>
              </div>
            </div>

            <div className="register-main-card">
              <h1 className="register-heading">Company registration</h1>
              <p className="register-subheading">All fields are required unless marked optional.</p>

              <form onSubmit={handleRegSubmit} className="register-form">
                <div className="register-section">
                  <h3 className="register-section-title">COMPANY INFORMATION</h3>
                  <div className="reg-field full-width">
                    <label className="reg-label">Registered Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      placeholder="e.g. Acme Gas Corporation"
                      value={regForm.companyName}
                      onChange={handleRegChange}
                      className="reg-input"
                      required
                    />
                  </div>
                  <div className="reg-grid two-col">
                    <div className="reg-field">
                      <label className="reg-label">DTI/SEC registration no.</label>
                      <input
                        type="text"
                        name="dtiSecNo"
                        placeholder="e.g. CS202412345"
                        value={regForm.dtiSecNo}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                    <div className="reg-field">
                      <label className="reg-label">DOE distributor license no.</label>
                      <input
                        type="text"
                        name="doeLicenseNo"
                        placeholder="e.g. DOE-LPG-2026-001"
                        value={regForm.doeLicenseNo}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="register-section">
                  <h3 className="register-section-title">BRANCH / LOCATION</h3>
                  <div className="reg-grid two-col">
                    <div className="reg-field">
                      <label className="reg-label">Primary Branch Name</label>
                      <input
                        type="text"
                        name="branchName"
                        placeholder="e.g. Main Branch"
                        value={regForm.branchName}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                    <div className="reg-field">
                      <label className="reg-label">City/Municipality</label>
                      <input
                        type="text"
                        name="cityMunicipality"
                        placeholder="e.g. Quezon City, Metro Manila"
                        value={regForm.cityMunicipality}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="reg-field full-width">
                    <label className="reg-label">Complete Address</label>
                    <input
                      type="text"
                      name="completeAddress"
                      placeholder="e.g. Building No., Street Name, Barangay"
                      value={regForm.completeAddress}
                      onChange={handleRegChange}
                      className="reg-input"
                      required
                    />
                  </div>
                </div>

                <div className="register-section">
                  <h3 className="register-section-title">ADMINISTRATOR ACCOUNT</h3>
                  <div className="reg-grid three-col">
                    <div className="reg-field">
                      <label className="reg-label">First name</label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First name"
                        value={regForm.firstName}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                    <div className="reg-field">
                      <label className="reg-label">Last name</label>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last name"
                        value={regForm.lastName}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                    <div className="reg-field">
                      <label className="reg-label">Email address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="admin@company.com"
                        value={regForm.email}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                  </div>
                  <div className="reg-grid two-col">
                    <div className="reg-field">
                      <label className="reg-label">Password</label>
                      <input
                        type="password"
                        name="regPassword"
                        placeholder="Min. 8 characters"
                        value={regForm.regPassword}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                    <div className="reg-field">
                      <label className="reg-label">Confirm password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Re-enter password"
                        value={regForm.confirmPassword}
                        onChange={handleRegChange}
                        className="reg-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="reg-checkbox-wrap">
                  <input
                    type="checkbox"
                    id="termsAgreed"
                    name="termsAgreed"
                    checked={regForm.termsAgreed}
                    onChange={handleRegChange}
                    className="reg-checkbox"
                    required
                  />
                  <label htmlFor="termsAgreed" className="reg-checkbox-label">
                    I confirm that the information provided is accurate and that I am authorized to register this company. I agree to the{" "}
                    <a href="#terms" className="reg-link">Terms of Service</a> and{" "}
                    <a href="#privacy" className="reg-link">Privacy Policy</a> in accordance with RA 10173.
                  </label>
                </div>

                <button type="submit" className="reg-submit-btn">
                  Submit registration
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ABOUT VIEW */}
        {currentView === "about" && (
          <div className="about-card">
            <div className="about-left">
              <span className="about-tag">ABOUT GASTRACK</span>
              <h1 className="about-title">
                Managing LPG inventory <span className="about-highlight">smarter</span>, not harder.
              </h1>
              <p className="about-description">
                GasTrack is a purpose-built inventory management system for LPG companies in the Philippines. We help LPG dealers track cylinder movements, deliveries, and stock levels across branches — in real time.
              </p>
            </div>

            <div className="about-right">
              <div className="about-stat-box">
                <span className="stat-number">2</span>
                <span className="stat-label">Active branches</span>
              </div>
              <div className="about-stat-box">
                <span className="stat-number">100%</span>
                <span className="stat-label">LPG focused</span>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT VIEW */}
        {currentView === "contact" && (
          <div className="contact-layout-container">
            <div className="contact-sidebar">
              <h2 className="contact-sidebar-title">Get in touch</h2>
              <div className="contact-sidebar-divider"></div>
              <p className="contact-sidebar-desc">
                Have questions about GasTrack or want to register your LPG company? Our team is here to help.
              </p>

              <div className="contact-info-list">
                <div className="contact-info-card">
                  <div className="info-icon-wrapper">
                    <Phone size={18} />
                  </div>
                  <div className="info-text">
                    <strong>Phone</strong>
                    <span>+63 9 8453 1234</span>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="info-icon-wrapper">
                    <Mail size={18} />
                  </div>
                  <div className="info-text">
                    <strong>Email</strong>
                    <span>gastrack.inventory@gmail.com</span>
                  </div>
                </div>

                <div className="contact-info-card">
                  <div className="info-icon-wrapper">
                    <Clock size={18} />
                  </div>
                  <div className="info-text">
                    <strong>Office hours</strong>
                    <span>Mon - Sat, 8:00AM - 5:00PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-main-card">
              <h1 className="contact-heading">Send us a message</h1>
              <p className="contact-subheading">We’ll get back to you within one business day.</p>

              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="reg-grid two-col">
                  <div className="reg-field">
                    <label className="reg-label">First name</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Juan"
                      value={contactForm.firstName}
                      onChange={handleContactChange}
                      className="reg-input"
                      required
                    />
                  </div>
                  <div className="reg-field">
                    <label className="reg-label">Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Dela Cruz"
                      value={contactForm.lastName}
                      onChange={handleContactChange}
                      className="reg-input"
                      required
                    />
                  </div>
                </div>

                <div className="reg-field full-width">
                  <label className="reg-label">Email address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="juandelacruz@gmail.com"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    className="reg-input"
                    required
                  />
                </div>

                <div className="reg-field full-width">
                  <label className="reg-label">Subject</label>
                  <div className="select-wrapper">
                    <select
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      className="reg-input reg-select"
                      required
                    >
                      <option value="" disabled hidden>Select a topic</option>
                      <option value="registration">Registration Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="sales">Sales & Pricing</option>
                      <option value="other">Other Concerns</option>
                    </select>
                    <ChevronDown size={18} className="select-chevron" />
                  </div>
                </div>

                <div className="reg-field full-width">
                  <label className="reg-label">Message</label>
                  <textarea
                    name="message"
                    rows="4"
                    placeholder="Describe your inquiry or concern..."
                    value={contactForm.message}
                    onChange={handleContactChange}
                    className="reg-input contact-textarea"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="contact-submit-btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}