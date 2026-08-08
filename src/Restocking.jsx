import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Box,
  Sliders,
  Package,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import ConfirmPOModal from "./ConfirmPOModal";
import CustomizeRestockModal from "./CustomizeRestockModal";
import CustomizeSingleItemModal from "./CustomizeSingleItemModal";
import "./Restocking.css";

const initialRestockData = [
  {
    restockId: "R-001",
    productId: "P-001",
    currentStock: 50,
    reorderLevel: 10,
    suggestedQty: 15,
    confidence: "88%",
    priority: "Low",
  },
  {
    restockId: "R-002",
    productId: "P-002",
    currentStock: 100,
    reorderLevel: 20,
    suggestedQty: 10,
    confidence: "89%",
    priority: "Low",
  },
  {
    restockId: "R-003",
    productId: "P-003",
    currentStock: 20,
    reorderLevel: 20,
    suggestedQty: 50,
    confidence: "99%",
    priority: "Critical",
  },
  {
    restockId: "R-004",
    productId: "P-004",
    currentStock: 34,
    reorderLevel: 10,
    suggestedQty: 10,
    confidence: "85%",
    priority: "Low",
  },
  {
    restockId: "R-005",
    productId: "P-005",
    currentStock: 15,
    reorderLevel: 10,
    suggestedQty: 30,
    confidence: "87%",
    priority: "Critical",
  },
];

export default function Restocking() {
  const [activeTab, setActiveTab] = useState("restocking");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReorderLevel, setSelectedReorderLevel] = useState("All Reorder Level");
  const [selectedSupplier, setSelectedSupplier] = useState("All Supplier");
  const [selectedPriority, setSelectedPriority] = useState("All Priority");
  const [selectedRows, setSelectedRows] = useState([]);

  // Modal States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isSingleCustomizeOpen, setIsSingleCustomizeOpen] = useState(false);
  const [selectedItemForCustomize, setSelectedItemForCustomize] = useState(null);

  // Purchase Order State
  const [poData, setPoData] = useState({
    poId: "PO-004",
    restockId: "R-004",
    supplierId: "S-002",
    items: [
      {
        productName: "Cylinder 2.7kg",
        qty: 10,
        costPrice: 1000.0,
        subtotal: 10000.0,
      },
    ],
    vatRate: 0.12,
    discount: 0.0,
  });

  const toggleSelectAll = () => {
    if (selectedRows.length === initialRestockData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(initialRestockData.map((item) => item.restockId));
    }
  };

  const toggleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleOpenSingleCustomize = (item) => {
    setSelectedItemForCustomize(item);
    setIsSingleCustomizeOpen(true);
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(false);
  };

  // Calculations for PO Summary
  const subtotalSum = poData.items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const totalQtySum = poData.items.reduce((acc, curr) => acc + curr.qty, 0);
  const totalCost = subtotalSum;

  return (
    <div className="restocking-page">
      <div className="restocking-inner">
        <h1 className="restocking-title">Restocking Assistant</h1>

        {/* Metric Cards */}
        <div className="restocking-cards-grid">
          <div className="restocking-card">
            <div className="restocking-card-label">Critical Urgencies</div>
            <div className="restocking-card-value">2 Products</div>
          </div>
          <div className="restocking-card">
            <div className="restocking-card-label">Restocking Cost</div>
            <div className="restocking-card-value">₱ 100,050</div>
          </div>
          <div className="restocking-card">
            <div className="restocking-card-label">Stockout Risk</div>
            <div className="restocking-card-value">Low</div>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="restocking-tabs-action-bar">
          <div className="restocking-tabs">
            <button
              className={`restocking-tab ${
                activeTab === "restocking" ? "active" : ""
              }`}
              onClick={() => setActiveTab("restocking")}
            >
              Restocking
            </button>
            <button
              className={`restocking-tab ${
                activeTab === "purchaseOrder" ? "active" : ""
              }`}
              onClick={() => setActiveTab("purchaseOrder")}
            >
              Purchase Order
            </button>
          </div>

          {activeTab === "restocking" && (
            <div className="restocking-actions">
              <button
                className="btn-purchase-order"
                onClick={() => setActiveTab("purchaseOrder")}
              >
                <Box size={16} /> Purchase Order
              </button>
              <button
                className="btn-customize"
                onClick={() => setIsCustomizeOpen(true)}
              >
                <Sliders size={16} /> Customize
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: RESTOCKING TABLE VIEW */}
        {activeTab === "restocking" && (
          <>
            {/* Search & Filters Toolbar */}
            <div className="restocking-toolbar">
              <div className="restocking-search">
                <input
                  type="text"
                  placeholder="Search by Product"
                  className="restocking-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={16} className="restocking-search-icon" />
              </div>

              <div className="restocking-select-wrap">
                <select
                  className="restocking-select"
                  value={selectedReorderLevel}
                  onChange={(e) => setSelectedReorderLevel(e.target.value)}
                >
                  <option value="All Reorder Level">All Reorder Level</option>
                </select>
                <ChevronDown size={16} className="restocking-select-icon" />
              </div>

              <div className="restocking-select-wrap">
                <select
                  className="restocking-select"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                >
                  <option value="All Supplier">All Supplier</option>
                </select>
                <ChevronDown size={16} className="restocking-select-icon" />
              </div>

              <div className="restocking-select-wrap">
                <select
                  className="restocking-select"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  <option value="All Priority">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Critical">Critical</option>
                </select>
                <ChevronDown size={16} className="restocking-select-icon" />
              </div>
            </div>

            {/* Table Structure */}
            <div className="restocking-table-wrap">
              <table className="restocking-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        className="restocking-checkbox"
                        checked={
                          selectedRows.length === initialRestockData.length &&
                          initialRestockData.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Restock ID</th>
                    <th>Product ID</th>
                    <th>Current Stock</th>
                    <th>Reorder Level</th>
                    <th>Suggested Qty</th>
                    <th>Confidence</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {initialRestockData.map((item) => {
                    const isSelected = selectedRows.includes(item.restockId);
                    return (
                      <tr
                        key={item.restockId}
                        className={isSelected ? "selected-row" : ""}
                      >
                        <td>
                          <input
                            type="checkbox"
                            className="restocking-checkbox"
                            checked={isSelected}
                            onChange={() => toggleRowSelect(item.restockId)}
                          />
                        </td>
                        <td>{item.restockId}</td>
                        <td>{item.productId}</td>
                        <td>{item.currentStock}</td>
                        <td>{item.reorderLevel}</td>
                        <td>{item.suggestedQty}</td>
                        <td>{item.confidence}</td>
                        <td>
                          <span
                            className={`restocking-priority-pill ${item.priority.toLowerCase()}`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td>
                          <div className="restocking-action-icons">
                            <button
                              className="restocking-action-icon adjust"
                              title="Customize"
                              onClick={() => handleOpenSingleCustomize(item)}
                            >
                              <Sliders size={16} />
                            </button>
                            <button
                              className="restocking-action-icon package"
                              title="Purchase Order"
                            >
                              <Package size={16} />
                            </button>
                            <button
                              className="restocking-action-icon delete"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 2: PURCHASE ORDER VIEW */}
        {activeTab === "purchaseOrder" && (
          <div className="po-container">
            {/* Left Card: Form Inputs & Item Details */}
            <div className="po-main-card">
              <div className="po-header-inputs">
                <div className="po-field">
                  <label>Purchase Order ID</label>
                  <input
                    type="text"
                    value={poData.poId}
                    onChange={(e) =>
                      setPoData({ ...poData, poId: e.target.value })
                    }
                  />
                </div>
                <div className="po-field">
                  <label>Restock ID</label>
                  <input
                    type="text"
                    value={poData.restockId}
                    onChange={(e) =>
                      setPoData({ ...poData, restockId: e.target.value })
                    }
                  />
                </div>
                <div className="po-field">
                  <label>Supplier ID</label>
                  <input
                    type="text"
                    value={poData.supplierId}
                    onChange={(e) =>
                      setPoData({ ...poData, supplierId: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="po-section">
                <div className="po-section-title">Items</div>
                <table className="po-items-table">
                  <thead>
                    <tr>
                      <th className="th-name">Product Name</th>
                      <th className="th-qty">Qty</th>
                      <th className="th-price">Cost Price</th>
                      <th className="th-subtotal">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {poData.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.productName}</td>
                        <td className="td-qty">{item.qty}</td>
                        <td className="td-price">
                          ₱ {item.costPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="td-subtotal">
                          ₱ {item.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="po-section">
                <div className="po-section-title">Total Summary</div>
                <div className="po-summary-rows">
                  <div className="po-summary-row">
                    <span className="label">Total Items:</span>
                    <span className="value">{poData.items.length}</span>
                  </div>
                  <div className="po-summary-row">
                    <span className="label">Total Quantity:</span>
                    <span className="value">{totalQtySum}</span>
                  </div>
                  <div className="po-summary-row">
                    <span className="label">Total Amount:</span>
                    <span className="value">
                      ₱ {subtotalSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Order Summary Panel */}
            <div className="po-side-card">
              <div className="po-side-header">
                <ShoppingCart size={18} /> Summary
              </div>
              <div className="po-side-body">
                <div className="po-calc-list">
                  <div className="po-calc-item">
                    <span>Subtotal:</span>
                    <span className="val">
                      ₱ {subtotalSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="po-calc-item">
                    <span>VAT (12%):</span>
                    <span className="val">₱ 0.00</span>
                  </div>
                  <div className="po-calc-item">
                    <span>Discount:</span>
                    <span className="val">₱ 0.00</span>
                  </div>
                </div>

                <div className="po-total-row">
                  <span className="po-total-label">Total Cost</span>
                  <span className="po-total-value">
                    ₱ {totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  className="po-btn-confirm"
                  onClick={() => setIsConfirmModalOpen(true)}
                >
                  Confirm Purchase Order
                </button>
                <button className="po-btn-draft">Save as Draft</button>
                <button className="po-btn-export">Export PDF</button>
                <button
                  className="po-btn-cancel"
                  onClick={() => setActiveTab("restocking")}
                >
                  Cancel Purchase Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmPOModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      {/* Global Restocking Customize Modal */}
      <CustomizeRestockModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
      />

      {/* Single Item Customize Modal */}
      <CustomizeSingleItemModal
        isOpen={isSingleCustomizeOpen}
        onClose={() => setIsSingleCustomizeOpen(false)}
        selectedItem={selectedItemForCustomize}
      />
    </div>
  );
}