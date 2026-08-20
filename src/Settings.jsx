import { useState } from "react";
import "./Settings.css";

// Sidebar navigation items (same as before, with Settings active)
const NAV_ITEMS = [
  { label: "Dashboard", icon: "📊" },
  { label: "POS Terminal", icon: "🖥️" },
  { label: "Inventory", icon: "📦" },
  { label: "Products", icon: "🛢️" },
  { label: "Sales", icon: "💵" },
  { label: "Restocking", icon: "🔁" },
  { label: "Suppliers", icon: "🚚" },
  { label: "Data", icon: "🗄️" },
  { label: "Users", icon: "👥" },
  { label: "Settings", icon: "⚙️", active: true },
  { label: "Report and Compliance", icon: "📋" },
  { label: "Order and Delivery", icon: "🚛" },
];

export default function Settings() {
  // --- Business Profile ---
  const [fullName, setFullName] = useState("GasTrack Inc.");
  const [contactEmail, setContactEmail] = useState("info@gastrack.com");
  const [address, setAddress] = useState("123 Main St, City");
  const [phone, setPhone] = useState("+63 912 345 6789");

  // --- Financial & Tax Rules ---
  const [taxRate, setTaxRate] = useState(12);
  const [currencySelector, setCurrencySelector] = useState("2 decimal standard");
  const [taxEnable, setTaxEnable] = useState(true);

  // --- Receipt and POS Output ---
  const [receiptHeader, setReceiptHeader] = useState("Thank you for your purchase!");
  const [footerMessage, setFooterMessage] = useState("Visit us again!");
  const [showLogo, setShowLogo] = useState(true);
  const [printSize, setPrintSize] = useState("Medium");
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(true);

  // --- System Behavior Rules ---
  const [autoLogout, setAutoLogout] = useState(30);
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [timezone, setTimezone] = useState("Local");
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("Light");

  // Toast / save handlers
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg) {
    setToastMsg(msg);
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => setToastMsg(""), 2500);
  }

  function handleSave(section) {
    showToast(`Settings for "${section}" saved successfully.`);
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🔥</span>
          <span className="brand-name">GasTrack</span>
        </div>

        <div className="sidebar-user">
          <span className="avatar">👤</span>
          <span className="bell">
            🔔<span className="bell-dot" />
          </span>
        </div>

        <div className="sidebar-search">
          <input type="text" placeholder="Search for..." />
          <span className="icon">🔍</span>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map(({ label, icon, active }) => (
            <a key={label} href="#" onClick={(e) => e.preventDefault()} className={`nav-item ${active ? "active" : ""}`}>
              <span className="nav-icon">{icon}</span>
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main settings-main">
        <h1 className="page-title">Settings</h1>

        <div className="settings-container">
          {/* --- BUSINESS PROFILE --- */}
          <section className="settings-section">
            <h2>Business Profile</h2>
            <div className="settings-grid">
              <div className="form-group">
                <label>Full name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contact email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn btn-outline">Upload logo</button>
              <button className="btn btn-primary" onClick={() => handleSave("Business Profile")}>Save</button>
            </div>
          </section>

          <hr className="section-divider" />

          {/* --- FINANCIAL & TAX RULES --- */}
          <section className="settings-section">
            <h2>Financial &amp; Tax Rules</h2>
            <div className="settings-grid">
              <div className="form-group">
                <label>Tax rate (%)</label>
                <input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Currency selector*</label>
                <select value={currencySelector} onChange={(e) => setCurrencySelector(e.target.value)}>
                  <option>Round up</option>
                  <option>Round down</option>
                  <option>2 decimal standard</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={taxEnable} onChange={(e) => setTaxEnable(e.target.checked)} />
                  Tax enable
                </label>
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn btn-outline">Test calculation</button>
              <button className="btn btn-primary" onClick={() => handleSave("Financial & Tax Rules")}>Save</button>
            </div>
          </section>

          <hr className="section-divider" />

          {/* --- RECEIPT AND POS OUTPUT --- */}
          <section className="settings-section">
            <h2>Receipt and POS Output</h2>
            <div className="settings-grid">
              <div className="form-group">
                <label>Receipt header text</label>
                <input type="text" value={receiptHeader} onChange={(e) => setReceiptHeader(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Footer message</label>
                <input type="text" value={footerMessage} onChange={(e) => setFooterMessage(e.target.value)} />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} />
                  Show logo
                </label>
              </div>
              <div className="form-group">
                <label>Print Size</label>
                <select value={printSize} onChange={(e) => setPrintSize(e.target.value)}>
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={showTaxBreakdown} onChange={(e) => setShowTaxBreakdown(e.target.checked)} />
                  Show tax breakdown
                </label>
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn btn-outline">Print text receipt</button>
              <button className="btn btn-primary" onClick={() => handleSave("Receipt and POS Output")}>Save</button>
            </div>
          </section>

          <hr className="section-divider" />

          {/* --- SYSTEM BEHAVIOR RULES --- */}
          <section className="settings-section">
            <h2>System Behavior Rules</h2>
            <div className="settings-grid">
              <div className="form-group">
                <label>Auto logout timer (minutes)</label>
                <input type="number" value={autoLogout} onChange={(e) => setAutoLogout(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Date format</label>
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                  <option>YYYY-MM-DD</option>
                  <option>DD/MM/YYYY</option>
                </select>
              </div>
              <div className="form-group">
                <label>System timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option>Local</option>
                  <option>UTC+0</option>
                  <option>GMT+1</option>
                </select>
              </div>
              <div className="form-group">
                <label>Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option>English</option>
                  <option>Español</option>
                  <option>Français</option>
                </select>
              </div>
              <div className="form-group">
                <label>Theme</label>
                <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn btn-primary" onClick={() => handleSave("System Behavior Rules")}>Save</button>
            </div>
          </section>
        </div>
      </main>

      {/* Toast notification */}
      {toastMsg && <div className="toast show">{toastMsg}</div>}
    </div>
  );
}