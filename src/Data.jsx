import React, { useState } from "react";
import { Download, FileText, ChevronDown, AlertTriangle } from "lucide-react";
import "./Data.css";

const initialLogsData = [
  { id: 1, file: "sales1.xlsx", type: "Sales", errors: 3, status: "Success", date: "2026-05-15" },
  { id: 2, file: "inventory12.csv", type: "Inventory", errors: 0, status: "Failed", date: "2026-05-18" },
  { id: 3, file: "inventory12.csv", type: "Inventory", errors: 0, status: "Success", date: "2026-05-18" },
  { id: 4, file: "gasseaoil.csv", type: "Sales", errors: 0, status: "Success", date: "2026-05-18" },
  { id: 5, file: "pos.pdf", type: "Inventory", errors: 0, status: "Failed", date: "2026-05-12" },
];

export default function Data() {
  const [activeTab, setActiveTab] = useState("Export");

  const [exportDataType, setExportDataType] = useState("Sales Data");
  const [exportDateRange, setExportDateRange] = useState("Today");

  const [importDataType, setImportDataType] = useState("Sales Data");
  const [importDateRange, setImportDateRange] = useState("Today");

  const [selectedLogRow, setSelectedLogRow] = useState(null);

  const getPageTitle = () => {
    return activeTab === "Export" || activeTab === "Export Logs"
      ? "Data Export"
      : "Data Import";
  };

  return (
    <div className="data-page">
      <div className="data-inner">
        <h1 className="data-title">{getPageTitle()}</h1>

        {/* Navigation Tabs */}
        <div className="data-tabs-wrap">
          <div className="data-tabs">
            {["Export", "Export Logs", "Import", "Import Logs"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`data-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedLogRow(null);
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* 1. EXPORT TAB                                                       */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Export" && (
          <div className="data-card-container">
            <div className="data-options-grid">
              <div className="data-form-side">
                <h2 className="data-section-heading">Export Options</h2>

                <div className="data-input-group">
                  <label className="data-label">Data Type</label>
                  <div className="data-select-wrap">
                    <select
                      className="data-select"
                      value={exportDataType}
                      onChange={(e) => setExportDataType(e.target.value)}
                    >
                      <option value="Sales Data">Sales Data</option>
                      <option value="Inventory Data">Inventory Data</option>
                      <option value="Products Data">Products Data</option>
                      <option value="Restocking Logs">Restocking Logs</option>
                    </select>
                    <ChevronDown size={18} className="data-select-icon" />
                  </div>
                </div>

                <div className="data-input-group">
                  <label className="data-label">Date Range</label>
                  <div className="data-select-wrap">
                    <select
                      className="data-select"
                      value={exportDateRange}
                      onChange={(e) => setExportDateRange(e.target.value)}
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                      <option value="Custom">Custom</option>
                    </select>
                    <ChevronDown size={18} className="data-select-icon" />
                  </div>
                </div>
              </div>

              <div className="data-action-card">
                <FileText size={38} className="data-action-icon" />
                <h3 className="data-action-title">Ready to Export</h3>
                <p className="data-action-sub">Select your preferred format to download</p>
                <div className="data-format-buttons">
                  <button type="button" className="data-btn-format">
                    <Download size={14} /> CSV
                  </button>
                  <button type="button" className="data-btn-format">
                    <Download size={14} /> Excel
                  </button>
                  <button type="button" className="data-btn-format">
                    <Download size={14} /> PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 2. EXPORT LOGS TAB                                                  */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Export Logs" && (
          <div className="data-logs-wrapper">
            <div className="data-table-card">
              <div className="data-card-header">
                <AlertTriangle size={22} className="data-alert-icon" />
                <h2>Data Export Validation History</h2>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Type</th>
                      <th>Errors</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialLogsData.map((log) => (
                      <tr
                        key={log.id}
                        className={selectedLogRow === log.id ? "selected" : ""}
                        onClick={() => setSelectedLogRow(log.id)}
                      >
                        <td>{log.file}</td>
                        <td>{log.type}</td>
                        <td>{log.errors}</td>
                        <td>
                          <span
                            className={`data-status-pill ${
                              log.status === "Success" ? "success" : "failed"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td>{log.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="data-actions-card">
              <h3 className="data-actions-title">Actions</h3>
              <div className="data-actions-buttons">
                <button type="button" className="btn-log-action btn-blue">
                  View Errors
                </button>
                <button type="button" className="btn-log-action btn-gray">
                  Download Error Report
                </button>
                <button type="button" className="btn-log-action btn-green">
                  Retry Export
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 3. IMPORT TAB                                                       */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Import" && (
          <div className="data-card-container">
            <div className="data-options-grid">
              <div className="data-form-side">
                <h2 className="data-section-heading">Import Options</h2>

                <div className="data-input-group">
                  <label className="data-label">Data Type</label>
                  <div className="data-select-wrap">
                    <select
                      className="data-select"
                      value={importDataType}
                      onChange={(e) => setImportDataType(e.target.value)}
                    >
                      <option value="Sales Data">Sales Data</option>
                      <option value="Inventory Data">Inventory Data</option>
                      <option value="Products Data">Products Data</option>
                      <option value="Supplier Records">Supplier Records</option>
                    </select>
                    <ChevronDown size={18} className="data-select-icon" />
                  </div>
                </div>

                <div className="data-input-group">
                  <label className="data-label">Date Range</label>
                  <div className="data-select-wrap">
                    <select
                      className="data-select"
                      value={importDateRange}
                      onChange={(e) => setImportDateRange(e.target.value)}
                    >
                      <option value="Today">Today</option>
                      <option value="This Week">This Week</option>
                      <option value="This Month">This Month</option>
                      <option value="Custom">Custom</option>
                    </select>
                    <ChevronDown size={18} className="data-select-icon" />
                  </div>
                </div>
              </div>

              <div className="data-action-card">
                <FileText size={38} className="data-action-icon" />
                <h3 className="data-action-title">Ready to Import</h3>
                <p className="data-action-sub">Select your preferred format to download</p>
                <div className="data-format-buttons">
                  <button type="button" className="data-btn-format">
                    <Download size={14} /> CSV
                  </button>
                  <button type="button" className="data-btn-format">
                    <Download size={14} /> Excel
                  </button>
                  <button type="button" className="data-btn-format">
                    <Download size={14} /> PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 4. IMPORT LOGS TAB                                                  */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === "Import Logs" && (
          <div className="data-logs-wrapper">
            <div className="data-table-card">
              <div className="data-card-header">
                <AlertTriangle size={22} className="data-alert-icon" />
                <h2>Data Import Validation History</h2>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>File</th>
                      <th>Type</th>
                      <th>Errors</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {initialLogsData.map((log) => (
                      <tr
                        key={log.id}
                        className={selectedLogRow === log.id ? "selected" : ""}
                        onClick={() => setSelectedLogRow(log.id)}
                      >
                        <td>{log.file}</td>
                        <td>{log.type}</td>
                        <td>{log.errors}</td>
                        <td>
                          <span
                            className={`data-status-pill ${
                              log.status === "Success" ? "success" : "failed"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td>{log.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="data-actions-card">
              <h3 className="data-actions-title">Actions</h3>
              <div className="data-actions-buttons">
                <button type="button" className="btn-log-action btn-blue">
                  View Errors
                </button>
                <button type="button" className="btn-log-action btn-gray">
                  Download Error Report
                </button>
                <button type="button" className="btn-log-action btn-green">
                  Retry Import
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}