import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingCart } from "lucide-react";
import "./Dashboard.css";

// ---------------------------------------------------------------------------
// Mock data — swap these out for real API calls / props in your app
// ---------------------------------------------------------------------------

const salesTrend = [
  { day: "Mon", value: 8 },
  { day: "Tue", value: 6.5 },
  { day: "Wed", value: 8.5 },
  { day: "Thu", value: 5 },
  { day: "Fri", value: 10 },
  { day: "Sat", value: 5 },
  { day: "Sun", value: 9 },
];

const statCards = [
  { label: "Sales Performance", value: "₱ 10,000", badge: "+2.5%", badgeTone: "neutral" },
  { label: "Transactions", value: "100", badge: "-1.2%", badgeTone: "dark" },
  { label: "Stock Attention", value: "2", badge: "View", badgeTone: "neutral", action: true },
  { label: "Best Seller", value: "Gasul LPG 2.7kg", badge: "View", badgeTone: "neutral", action: true },
];

const restockSuggestions = [
  { id: 1, name: "Gasul LPG 2.7kg", stock: 5, suggest: 50, status: "Critical" },
  { id: 2, name: "Cylinder 11kg", stock: 10, suggest: 30, status: "Critical" },
  { id: 3, name: "POL Regulator", stock: 11, suggest: 20, status: "Low Stock" },
];

const activityLog = [
  { id: 1, text: "Cashier processed Order #12", date: "05/20/2026", time: "4:00 PM" },
  { id: 2, text: "Admin adjusted stock of Product P-001", date: "05/20/2026", time: "12:00 PM" },
  { id: 3, text: "Admin adjusted stock of Product P-020", date: "05/20/2026", time: "11:30 AM" },
  { id: 4, text: "Admin approved purchase order of P-010", date: "05/20/2026", time: "9:35 AM" },
  { id: 5, text: "Stockman adjusted inventory due to damages on P-005", date: "05/20/2026", time: "7:00 AM" },
];

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function Badge({ children, tone = "neutral", onClick }) {
  const toneClass = tone === "dark" ? "badge badge-dark" : "badge";
  return (
    <button type="button" onClick={onClick} className={toneClass}>
      {children}
    </button>
  );
}

function StatCard({ label, value, badge, badgeTone, action }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <div className="stat-row">
        <span className="stat-value">{value}</span>
        <Badge tone={badgeTone} onClick={action ? () => {} : undefined}>
          {badge}
        </Badge>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const className = status === "Critical" ? "pill pill-critical" : "pill pill-low";
  return <span className={className}>{status}</span>;
}

function RestockRow({ item }) {
  return (
    <div className="restock-row">
      <div>
        <p className="restock-name">{item.name}</p>
        <p className="restock-meta">
          Stock: {item.stock} &nbsp;|&nbsp; Suggest: {item.suggest}
        </p>
      </div>
      <div className="restock-actions">
        <StatusPill status={item.status} />
        <button type="button" aria-label={`Reorder ${item.name}`} className="icon-button">
          <ShoppingCart size={20} />
        </button>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">₱{payload[0].value}k</p>
      </div>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main Dashboard component
// ---------------------------------------------------------------------------

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-inner">
        <h1 className="dashboard-title">Dashboard</h1>

        {/* Stat cards */}
        <div className="stat-grid">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Sales trend + Restock suggestion */}
        <div className="two-col">
          {/* Sales Trend */}
          <div className="panel">
            <h2 className="panel-title">Sales Trend</h2>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eee" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2.5, 5, 7.5, 10]}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#059669", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Restock Suggestion */}
          <div className="panel">
            <h2 className="panel-title">Restock Suggestion</h2>
            <div className="restock-list">
              {restockSuggestions.map((item) => (
                <RestockRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Activity Timeline</h2>
            <Badge onClick={() => {}}>View Logs</Badge>
          </div>
          <div className="activity-list">
            {activityLog.map((entry) => (
              <div key={entry.id} className="activity-row">
                <span className="activity-text">{entry.text}</span>
                <span className="activity-date">
                  {entry.date} &nbsp; {entry.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
