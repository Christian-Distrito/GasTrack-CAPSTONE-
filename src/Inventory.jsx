import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  FileText,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import AddStockInModal from "./AddStockInModal";
import AddStockOutModal from "./AddStockOutModal";
import StockAdjustmentModal from "./StockAdjustmentModal";
import "./Inventory.css";

const initialInventory = [
  {
    inventoryId: "P-001",
    productId: "P-001",
    warehouse: "Pasig",
    currentStock: 50,
    reorderLimit: 10,
    status: "Normal",
  },
  {
    inventoryId: "P-002",
    productId: "P-002",
    warehouse: "San Juan",
    currentStock: 100,
    reorderLimit: 10,
    status: "Normal",
  },
  {
    inventoryId: "P-003",
    productId: "P-003",
    warehouse: "Pasig",
    currentStock: 20,
    reorderLimit: 20,
    status: "Critical",
  },
  {
    inventoryId: "P-004",
    productId: "P-004",
    warehouse: "San Juan",
    currentStock: 34,
    reorderLimit: 10,
    status: "Normal",
  },
  {
    inventoryId: "P-005",
    productId: "P-005",
    warehouse: "San Juan",
    currentStock: 60,
    reorderLimit: 20,
    status: "Low Stock",
  },
];

const initialTransactions = [
  {
    transactionId: "T-001",
    productId: "P-001",
    productName: "Gas LPG 2.7kg",
    warehouse: "Pasig",
    type: "In",
    quantity: 10,
    reference: "Supplier",
    date: "01/15/2026",
    user: "U-001",
  },
  {
    transactionId: "T-002",
    productId: "P-002",
    productName: "Gas LPG 7kg",
    warehouse: "San Juan",
    type: "Out",
    quantity: 2,
    reference: "POS",
    date: "01/06/2026",
    user: "U-003",
  },
  {
    transactionId: "T-003",
    productId: "P-003",
    productName: "Gas LPG 11kg",
    warehouse: "Pasig",
    type: "Adjust",
    quantity: 30,
    reference: "Supplier",
    date: "01/03/2026",
    user: "U-002",
  },
  {
    transactionId: "T-004",
    productId: "P-004",
    productName: "Cylinder 2.7kg",
    warehouse: "San Juan",
    type: "Out",
    quantity: 5,
    reference: "POS",
    date: "01/02/2026",
    user: "U-003",
  },
  {
    transactionId: "T-005",
    productId: "P-005",
    productName: "Cylinder 7kg",
    warehouse: "San Juan",
    type: "Out",
    quantity: 20,
    reference: "POS",
    date: "01/01/2026",
    user: "U-003",
  },
];

export default function Inventory() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All Warehouse");
  const [selectedStatus, setSelectedStatus] = useState("Inventory Status");

  // Modal States
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  const getStatusClass = (status) => {
    switch (status) {
      case "Normal":
        return "normal";
      case "Critical":
        return "critical";
      case "Low Stock":
        return "low-stock";
      default:
        return "";
    }
  };

  return (
    <div className="inventory-page">
      <div className="inventory-inner">
        <h1 className="inventory-title">Inventory</h1>

        {/* Metric Cards */}
        <div className="inventory-cards-grid">
          <div className="inventory-card">
            <div className="inventory-card-label">Critical Items</div>
            <div className="inventory-card-value">15</div>
          </div>
          <div className="inventory-card">
            <div className="inventory-card-label">Low Stock Items</div>
            <div className="inventory-card-value">5</div>
          </div>
          <div className="inventory-card">
            <div className="inventory-card-label">Normal Items</div>
            <div className="inventory-card-value">10</div>
          </div>
        </div>

        {/* Tabs & Action Buttons */}
        <div className="inventory-tabs-action-bar">
          <div className="inventory-tabs">
            <button
              className={`inventory-tab ${
                activeTab === "inventory" ? "active" : ""
              }`}
              onClick={() => setActiveTab("inventory")}
            >
              Inventory
            </button>
            <button
              className={`inventory-tab ${
                activeTab === "transactions" ? "active" : ""
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              Inventory Transactions
            </button>
          </div>

          <div className="inventory-actions">
            <button className="action-btn">
              <Upload size={16} /> Import Inventory Data
            </button>
            <button
              className="action-btn"
              onClick={() => setIsStockInOpen(true)}
            >
              <Plus size={16} /> Add Stock In
            </button>
            <button
              className="action-btn"
              onClick={() => setIsStockOutOpen(true)}
            >
              <Plus size={16} /> Add Stock Out
            </button>
            <button
              className="action-btn"
              onClick={() => setIsAdjustmentOpen(true)}
            >
              <Plus size={16} /> Stock Adjustment
            </button>
          </div>
        </div>

        {/* Search & Filters Toolbar */}
        <div className="inventory-toolbar">
          <div className="inventory-search">
            <input
              type="text"
              placeholder="Search Inventory by Product"
              className="inventory-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="inventory-search-icon" />
          </div>

          <div className="inventory-select-wrap">
            <select
              className="inventory-select"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              <option value="All Warehouse">All Warehouse</option>
              <option value="Pasig">Pasig</option>
              <option value="San Juan">San Juan</option>
            </select>
            <ChevronDown size={16} className="inventory-select-icon" />
          </div>

          <div className="inventory-select-wrap">
            <select
              className="inventory-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="Inventory Status">Inventory Status</option>
              <option value="Normal">Normal</option>
              <option value="Critical">Critical</option>
              <option value="Low Stock">Low Stock</option>
            </select>
            <ChevronDown size={16} className="inventory-select-icon" />
          </div>
        </div>

        {/* Table View Conditional Rendering */}
        <div className="inventory-table-wrap">
          {activeTab === "inventory" ? (
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Inventory ID</th>
                  <th>Product ID</th>
                  <th>Warehouse</th>
                  <th>Current Stock</th>
                  <th>Reorder Limit</th>
                  <th>Status</th>
                  <th>Stock Actions</th>
                </tr>
              </thead>
              <tbody>
                {initialInventory.map((item) => (
                  <tr key={item.inventoryId}>
                    <td>{item.inventoryId}</td>
                    <td>{item.productId}</td>
                    <td>{item.warehouse}</td>
                    <td>{item.currentStock}</td>
                    <td>{item.reorderLimit}</td>
                    <td>
                      <span
                        className={`inventory-status-pill ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="inventory-action-icons">
                        <button className="inventory-action-icon view" title="View">
                          <FileText size={16} />
                        </button>
                        <button className="inventory-action-icon edit" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className="inventory-action-icon delete" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="inventory-table transactions-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Warehouse</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {initialTransactions.map((tx) => (
                  <tr key={tx.transactionId}>
                    <td>{tx.transactionId}</td>
                    <td>{tx.productId}</td>
                    <td>{tx.productName}</td>
                    <td>{tx.warehouse}</td>
                    <td>{tx.type}</td>
                    <td>{tx.quantity}</td>
                    <td>{tx.reference}</td>
                    <td>{tx.date}</td>
                    <td>{tx.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pop-up Modals */}
      <AddStockInModal
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
      />
      <AddStockOutModal
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
      />
      <StockAdjustmentModal
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
      />
    </div>
  );
}