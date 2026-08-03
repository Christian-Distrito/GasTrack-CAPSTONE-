import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./AddUserModal.css";

const roleOptions = ["Admin", "Manager", "Inventory Staff", "Driver", "Helper"];
const branchOptions = ["Pasig Warehouse", "San Juan Warehouse"];
const statusOptions = ["Active", "Inactive"];

const moduleOptions = [
  { key: "dashboard", label: "Dashboard" },
  { key: "pos", label: "POS Terminal" },
  { key: "inventory", label: "Inventory" },
  { key: "products", label: "Product Module" },
  { key: "suppliers", label: "Supplier Module" },
  { key: "data", label: "Data" },
];

const emptyForm = {
  fullName: "",
  usernameEmail: "",
  password: "",
  confirmPassword: "",
  role: "",
  branch: "",
  status: "Active",
  modules: { dashboard: true }, // Dashboard checked by default, matching the design
};

// ---------------------------------------------------------------------------
// AddUserModal
//
// Props:
// - isOpen: boolean
// - onCancel: () => void
// - onSave: (formData) => void
// ---------------------------------------------------------------------------

export default function AddUserModal({ isOpen, onCancel, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleModule = (key) => {
    setForm((prev) => ({
      ...prev,
      modules: { ...prev.modules, [key]: !prev.modules[key] },
    }));
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setError("");
    onCancel();
  };

  const handleSave = () => {
    if (!form.fullName || !form.usernameEmail || !form.password || !form.confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!form.role || !form.branch) {
      setError("Please select a role and branch/warehouse.");
      return;
    }
    setError("");
    onSave(form);
    setForm(emptyForm);
  };

  return (
    <div className="add-user-overlay" onClick={resetAndClose}>
      <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="add-user-title">New User Information</h2>

        {/* Basic Information */}
        <h3 className="add-user-section">BASIC INFORMATION</h3>
        <div className="add-user-grid three-col">
          <div className="field">
            <label className="field-label">Full Name</label>
            <input
              type="text"
              placeholder="ABC Company"
              className="field-input"
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Username / Email Address</label>
            <input
              type="text"
              placeholder="killianjulian@gmail.com"
              className="field-input"
              value={form.usernameEmail}
              onChange={(e) => updateField("usernameEmail", e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="field-input"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
            />
          </div>
        </div>

        {/* Password field — needed alongside Confirm Password even though the
            reference design only showed one password box */}
        <div className="add-user-grid three-col">
          <div className="field">
            <label className="field-label">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="field-input"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </div>
        </div>

        {/* Role & Assignment */}
        <h3 className="add-user-section">Role &amp; Assignment</h3>
        <div className="add-user-grid three-col">
          <div className="field">
            <label className="field-label">Role</label>
            <div className="select-wrap">
              <select
                className="field-select"
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
              >
                <option value="">Select role</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Branch / Warehouse</label>
            <div className="select-wrap">
              <select
                className="field-select"
                value={form.branch}
                onChange={(e) => updateField("branch", e.target.value)}
              >
                <option value="">Select Branch / Warehouse</option>
                {branchOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>
          <div className="field">
            <label className="field-label">Status</label>
            <div className="select-wrap">
              <select
                className="field-select"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>
        </div>

        {/* Module Access */}
        <h3 className="add-user-section">Module Access</h3>
        <div className="module-list">
          {moduleOptions.map(({ key, label }) => (
            <label key={key} className="module-checkbox">
              <input
                type="checkbox"
                checked={!!form.modules[key]}
                onChange={() => toggleModule(key)}
              />
              <span className="module-box" />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {error && <p className="add-user-error">{error}</p>}

        {/* Actions */}
        <div className="add-user-actions">
          <button type="button" className="add-user-btn cancel" onClick={resetAndClose}>
            Cancel
          </button>
          <button type="button" className="add-user-btn save" onClick={handleSave}>
            Save User
          </button>
        </div>
      </div>
    </div>
  );
}