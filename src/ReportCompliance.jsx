import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarX2,
  CalendarCheck2,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Info,
} from "lucide-react";
import "./ReportCompliance.css";

// ---------------------------------------------------------------------------
// Mock data — replace with real API data
// Dates use ISO "YYYY-MM-DD" so they're easy to compare against calendar cells.
// ---------------------------------------------------------------------------

const reports = [
  {
    id: "r1",
    name: "Monthly Sales Summary",
    period: "June 2026",
    dueDate: "2026-06-30",
    dueLabel: "Due: Jun 30, 2026",
    relative: "Tomorrow",
    size: "2.4 MB",
    status: "Due Soon", // Due Soon | Upcoming | Overdue
  },
  {
    id: "r2",
    name: "Q2 Inventory Audit",
    period: "May 2026",
    dueDate: "2026-07-05",
    dueLabel: "Due: Jul 5, 2026",
    relative: "In 5 days",
    size: "1.1 MB",
    status: "Upcoming",
  },
  {
    id: "r3",
    name: "Restocking History",
    period: "May 2026",
    dueDate: "2026-07-15",
    dueLabel: "Due: Jul 15, 2026",
    relative: "In 15 days",
    size: "845 KB",
    status: "Upcoming",
  },
];

const statCards = [
  {
    label: "Reports Due Soon",
    value: 2,
    sub: "Within 7 days",
    tone: "purple",
    icon: CalendarClock,
  },
  {
    label: "Overdue Reports",
    value: 1,
    sub: "Past due date",
    tone: "red",
    icon: CalendarX2,
  },
  {
    label: "Submitted This Month",
    value: 3,
    sub: "June 2026",
    tone: "green",
    icon: CalendarCheck2,
  },
  {
    label: "Total Reports",
    value: 12,
    sub: "All time",
    tone: "blue",
    icon: FileText,
  },
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function statusIconTone(status) {
  if (status === "Overdue" || status === "Due Soon") return "danger";
  if (status === "Upcoming") return "warning";
  return "success";
}

function statusPillClass(status) {
  if (status === "Overdue" || status === "Due Soon") return "status-pill danger";
  if (status === "Upcoming") return "status-pill warning";
  return "status-pill success";
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Build a Monday-first 6-row calendar grid for the given month/year,
// including the trailing days of the previous/next month to fill the grid.
function buildCalendarGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  // getDay(): 0=Sun..6=Sat -> convert to Monday-first index (0=Mon..6=Sun)
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

  const gridStart = new Date(year, month, 1 - firstWeekday);

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + i);
    cells.push(cellDate);
  }
  return cells;
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, tone, icon: Icon }) {
  return (
    <div className="rc-stat-card">
      <div className={`rc-stat-icon ${tone}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="rc-stat-label">{label}</p>
        <p className={`rc-stat-value ${tone}`}>{value}</p>
        <p className={`rc-stat-sub ${tone}`}>{sub}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recent report row
// ---------------------------------------------------------------------------

function ReportRow({ report }) {
  const tone = statusIconTone(report.status);
  return (
    <div className="report-row">
      <div className={`report-icon ${tone}`}>
        <FileText size={20} />
      </div>
      <div className="report-info">
        <p className="report-name">{report.name}</p>
        <p className="report-period">{report.period}</p>
        <p className="report-size">{report.size}</p>
      </div>
      <div className="report-due">
        <p className={`report-due-date ${tone}`}>{report.dueLabel}</p>
        <p className={`report-relative ${tone}`}>{report.relative}</p>
      </div>
      <span className={statusPillClass(report.status)}>{report.status}</span>
      <button type="button" className="report-menu-btn" aria-label="More options">
        <MoreVertical size={18} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ReportCompliance() {
  const initial = new Date(2026, 5, 30); // June 30, 2026 — matches the reference design
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selectedDate, setSelectedDate] = useState(toISODate(initial));

  const reportsByDate = useMemo(() => {
    const map = {};
    reports.forEach((r) => {
      if (!map[r.dueDate]) map[r.dueDate] = [];
      map[r.dueDate].push(r);
    });
    return map;
  }, []);

  const cells = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const goToToday = () => {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(toISODate(today));
  };

  const goToPrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const goToNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedReports = reportsByDate[selectedDate] || [];

  return (
    <div className="rc-page">
      <div className="rc-inner">
        <h1 className="rc-title">Report and Compliance</h1>

        {/* Stat cards */}
        <div className="rc-stat-grid">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Recent reports + Calendar */}
        <div className="rc-layout">
          {/* Recent Reports */}
          <div className="rc-panel">
            <h2 className="rc-panel-title">RECENT REPORTS</h2>
            <div className="report-table-header">
              <span>Report</span>
              <span>Due Date</span>
              <span>Status</span>
            </div>
            <div className="report-list">
              {reports.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </div>
            <a href="#" className="rc-link">
              View all reports <ChevronRight size={14} />
            </a>
          </div>

          {/* Calendar */}
          <div className="rc-panel">
            <div className="calendar-header">
              <h2 className="calendar-title">{monthLabel}</h2>
              <div className="calendar-nav">
                <button type="button" className="calendar-nav-btn" onClick={goToPrevMonth} aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" className="calendar-nav-btn" onClick={goToNextMonth} aria-label="Next month">
                  <ChevronRight size={16} />
                </button>
                <button type="button" className="calendar-today-btn" onClick={goToToday}>
                  Today
                </button>
              </div>
            </div>

            <div className="calendar-weekdays">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {cells.map((cellDate) => {
                const iso = toISODate(cellDate);
                const inCurrentMonth = cellDate.getMonth() === viewMonth;
                const isSelected = iso === selectedDate;
                const dayReports = reportsByDate[iso] || [];
                const dotTone = dayReports.length
                  ? statusIconTone(dayReports[0].status)
                  : null;

                return (
                  <button
                    type="button"
                    key={iso}
                    className={`calendar-cell ${inCurrentMonth ? "" : "muted"} ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedDate(iso)}
                  >
                    <span>{cellDate.getDate()}</span>
                    {dotTone && !isSelected && <span className={`calendar-dot ${dotTone}`} />}
                    {dotTone && isSelected && <span className="calendar-dot selected-dot" />}
                  </button>
                );
              })}
            </div>

            {/* Reports due on selected date */}
            <div className="selected-date-section">
              <h3 className="selected-date-title">Reports Due on Selected Date</h3>
              {selectedReports.length === 0 ? (
                <p className="selected-date-empty">No reports due on this date.</p>
              ) : (
                selectedReports.map((report) => {
                  const tone = statusIconTone(report.status);
                  return (
                    <div key={report.id} className="selected-report-row">
                      <div className={`report-icon small ${tone}`}>
                        <FileText size={16} />
                      </div>
                      <div className="selected-report-info">
                        <p className="report-name">{report.name}</p>
                        <p className={`report-due-date ${tone}`}>{report.dueLabel}</p>
                      </div>
                      <span className={statusPillClass(report.status)}>{report.status}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Legend */}
            <div className="calendar-legend">
              <span>
                <span className="legend-dot danger" /> Due Soon / Overdue
              </span>
              <span>
                <span className="legend-dot warning" /> Upcoming
              </span>
              <span>
                <span className="legend-dot success" /> Later
              </span>
            </div>

            <a href="#" className="rc-link">
              View full calendar <ChevronRight size={14} />
            </a>
          </div>
        </div>

        {/* Stay Compliant banner */}
        <div className="rc-banner">
          <div className="rc-banner-left">
            <Info size={22} className="rc-banner-icon" />
            <div>
              <p className="rc-banner-title">Stay Compliant</p>
              <p className="rc-banner-text">
                Submit reports on time to ensure compliance and avoid penalties.
              </p>
            </div>
          </div>
          <button type="button" className="rc-banner-btn">
            View Compliance Guidelines
          </button>
        </div>
      </div>
    </div>
  );
}