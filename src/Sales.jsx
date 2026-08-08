import React, { useMemo, useState } from "react";
import { ChevronDown, Download, FileSearch, Printer, Trash2 } from "lucide-react";
import SalesInfoModal from "./SalesInfoModal";
import "./Sales.css";

// ---------------------------------------------------------------------------
// Mock data — replace with real API data
// `status` isn't shown as a table column in the reference design, but the
// "All Status" filter implies each sale has one (e.g. for voided/refunded
// transactions) — kept here so that filter is actually functional.
// `items` and `cashierName` power the Sales Information modal.
// ---------------------------------------------------------------------------

const mockSales = [
  {
    id: "SL-001",
    datetime: "01/05/2026 10:35 AM",
    cashier: "U-003",
    cashierName: "Teodore Metro",
    orderId: "O-001",
    type: "Delivery",
    amount: 243.0,
    status: "Completed",
    discount: 0,
    items: [{ name: "Gasul LPG 2.7kg", qty: 1, costPrice: 217.0 }],
  },
  {
    id: "SL-002",
    datetime: "01/05/2026 10:22 AM",
    cashier: "U-003",
    cashierName: "Teodore Metro",
    orderId: "O-002",
    type: "Walk-in",
    amount: 1000.0,
    status: "Completed",
    discount: 0,
    items: [{ name: "Cylinder 2.7kg", qty: 1, costPrice: 892.86 }],
  },
  {
    id: "SL-003",
    datetime: "01/04/2026 3:30 PM",
    cashier: "U-003",
    cashierName: "Teodore Metro",
    orderId: "O-003",
    type: "Delivery",
    amount: 550.0,
    status: "Completed",
    discount: 0,
    items: [{ name: "Gasul LPG 7kg", qty: 1, costPrice: 491.07 }],
  },
  {
    id: "SL-004",
    datetime: "01/03/2026 2:48 PM",
    cashier: "U-003",
    cashierName: "Teodore Metro",
    orderId: "O-004",
    type: "Walk-in",
    amount: 105.0,
    status: "Voided",
    discount: 0,
    items: [{ name: "POL Regulator", qty: 1, costPrice: 93.75 }],
  },
  {
    id: "SL-005",
    datetime: "01/01/2026 9:30 AM",
    cashier: "U-001",
    cashierName: "Juan Dela Cruz",
    orderId: "O-005",
    type: "Pickup",
    amount: 907.0,
    status: "Completed",
    discount: 0,
    items: [{ name: "Gasul LPG 11kg", qty: 1, costPrice: 809.82 }],
  },
];

const statCards = [
  { label: "Today's Sale", value: "₱ 15,000.00" },
  { label: "Total Transaction", value: "50" },
  { label: "Average Order Value", value: "₱ 500.00" },
  { label: "Peak Hour", value: "10:00 AM" },
];

const cashiers = ["All Cashier", ...new Set(mockSales.map((s) => s.cashier))];
const statuses = ["All Status", "Completed", "Voided"];

function formatPeso(amount) {
  return `₱ ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

function StatCard({ label, value }) {
  return (
    <div className="sales-stat-card">
      <p className="sales-stat-label">{label}</p>
      <p className="sales-stat-value">{value}</p>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="sales-select-wrap">
      <select className="sales-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="sales-select-icon" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Sales component
// ---------------------------------------------------------------------------

export default function Sales() {
  const [sales] = useState(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [cashierFilter, setCashierFilter] = useState("All Cashier");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedSale, setSelectedSale] = useState(null);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCashier = cashierFilter === "All Cashier" || s.cashier === cashierFilter;
      const matchesStatus = statusFilter === "All Status" || s.status === statusFilter;
      return matchesSearch && matchesCashier && matchesStatus;
    });
  }, [sales, searchTerm, cashierFilter, statusFilter]);

  const handleImport = () => {
    // Hook this up to a file picker / CSV import flow
    console.log("Import Sales Data clicked");
  };

  const handleView = (sale) => setSelectedSale(sale);
  const handlePrint = (sale) => console.log("Print receipt for", sale);
  const handleDelete = (sale) => console.log("Delete", sale);

  return (
    <div className="sales-page">
      <div className="sales-inner">
        <h1 className="sales-title">Sales</h1>

        {/* Stat cards */}
        <div className="sales-stat-grid">
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        {/* Toolbar */}
        <div className="sales-toolbar">
          <input
            type="text"
            placeholder="Search By Sales ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sales-search-input"
          />

          <FilterSelect value={cashierFilter} onChange={setCashierFilter} options={cashiers} />
          <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statuses} />

          <button type="button" className="import-btn" onClick={handleImport}>
            <Download size={16} />
            Import Sales Data
          </button>
        </div>

        {/* Table */}
        <div className="sales-table-wrap">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Sales ID</th>
                <th>Date and Time</th>
                <th>Cashier</th>
                <th>Order ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{sale.datetime}</td>
                  <td>{sale.cashier}</td>
                  <td>{sale.orderId}</td>
                  <td>{sale.type}</td>
                  <td>{formatPeso(sale.amount)}</td>
                  <td>
                    <div className="sales-action-icons">
                      <button
                        type="button"
                        className="sales-action-icon view"
                        aria-label={`View ${sale.id}`}
                        onClick={() => handleView(sale)}
                      >
                        <FileSearch size={16} />
                      </button>
                      <button
                        type="button"
                        className="sales-action-icon print"
                        aria-label={`Print receipt for ${sale.id}`}
                        onClick={() => handlePrint(sale)}
                      >
                        <Printer size={16} />
                      </button>
                      <button
                        type="button"
                        className="sales-action-icon delete"
                        aria-label={`Delete ${sale.id}`}
                        onClick={() => handleDelete(sale)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-results-cell">
                    No sales match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SalesInfoModal
        isOpen={!!selectedSale}
        sale={selectedSale}
        storeName="GasTrack Store"
        onClose={() => setSelectedSale(null)}
      />
    </div>
  );
}