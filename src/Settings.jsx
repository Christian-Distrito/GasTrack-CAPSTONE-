import React, { useState, useRef } from "react";
import "./Settings.css";

export default function Settings() {
  const [taxEnabled, setTaxEnabled] = useState(true);
  
  // State and ref for handling the logo upload
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Trigger the hidden file input when the dropzone is clicked
  const handleDropzoneClick = () => {
    fileInputRef.current.click();
  };

  // Handle the file selection and generate a preview URL
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  return (
    <div className="settings-page">
      <h1 className="page-title">Settings</h1>

      {/* ─── BUSINESS PROFILE ─── */}
      <div className="settings-card">
        <h2 className="card-title">Business Profile</h2>
        <div className="business-profile-grid">
          <div className="input-column">
            <div className="form-group">
              <label>Full name</label>
              <input type="text" className="form-control" />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" className="form-control" />
            </div>
          </div>
          
          <div className="input-column">
            <div className="form-group">
              <label>Contact email</label>
              <input type="email" className="form-control" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" className="form-control" />
            </div>
          </div>

          <div className="logo-upload-wrapper">
            {/* Hidden file input */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: "none" }} 
            />
            
            {/* Dropzone Area */}
            <div className="logo-dropzone" onClick={handleDropzoneClick}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="logo-preview-img" />
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: "8px"}}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <span className="choose-file-btn">Choose file</span>
                </>
              )}
            </div>
            <span className="upload-label">Upload logo</span>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn btn-primary">Save</button>
        </div>
      </div>

      {/* ─── FINANCIAL & TAX RULES ─── */}
      <div className="settings-card">
        <h2 className="card-title">Financial & Tax Rules</h2>
        <div className="grid-2-col">
          <div className="input-column">
            <div className="form-group">
              <label>Tax rate(%)</label>
              <input type="text" className="form-control" />
            </div>
            <div className="toggle-group" style={{ marginTop: "8px" }}>
              <label>Tax enable</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={taxEnabled} 
                  onChange={(e) => setTaxEnabled(e.target.checked)} 
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="input-column">
            <div className="form-group">
              <label>Currency selector</label>
              <input type="text" className="form-control" />
            </div>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" /> Round up
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> Round down
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> 2 decimal standard
              </label>
            </div>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn btn-success">Test calculation</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </div>

      {/* ─── RECEIPT AND POS OUTPUT ─── */}
      <div className="settings-card">
        <h2 className="card-title">Receipt and POS Output</h2>
        <div className="grid-2-col">
          <div className="input-column">
            <div className="form-group">
              <label>Receipt header text</label>
              <input type="text" className="form-control" />
            </div>
            <div className="checkbox-group" style={{ marginTop: "8px" }}>
              <label className="checkbox-label">
                <input type="checkbox" /> Show logo
              </label>
              <label className="checkbox-label">
                <input type="checkbox" /> Show tax breakdown
              </label>
            </div>
          </div>

          <div className="input-column">
            <div className="form-group">
              <label>Footer message</label>
              <input type="text" className="form-control" />
            </div>
            <div className="form-group">
              <label>Print Size</label>
              <select className="form-control">
                <option value=""></option>
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-actions">
          <button className="btn btn-success">Print text receipt</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </div>

      {/* ─── SYSTEM BEHAVIOR RULES ─── */}
      <div className="settings-card">
        <h2 className="card-title">System Behavior Rules</h2>
        <div className="grid-3-col">
          <div className="input-column">
            <div className="form-group">
              <label>Auto logout timer (minutes)</label>
              <input type="text" className="form-control" />
            </div>
            <div className="form-group">
              <label>System timezone</label>
              <select className="form-control">
                <option value=""></option>
                <option value="UTC">UTC</option>
                <option value="PST">PST</option>
              </select>
            </div>
          </div>

          <div className="input-column">
            <div className="form-group">
              <label>Date format</label>
              <input type="text" className="form-control" />
            </div>
            <div className="form-group">
              <label>Language</label>
              <select className="form-control">
                <option value=""></option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>
          </div>

          <div className="input-column" style={{ justifyContent: "space-between" }}>
            <div className="form-group">
              <label>Theme</label>
              <select className="form-control">
                <option value=""></option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div className="card-actions-inline">
              <button className="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
