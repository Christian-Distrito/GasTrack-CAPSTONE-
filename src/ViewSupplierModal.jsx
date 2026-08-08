import React, { useState } from "react";
import "./ViewSupplierModal.css";

const sampleProducts = [
  { id: "P-001", name: "Gas LPG 2.7 kg", costPrice: "₱ 243.00", leadTime: "2 days", minOrderQty: 10, status: "Active" },
  { id: "P-002", name: "Gas LPG 7kg", costPrice: "₱ 603.00", leadTime: "2 days", minOrderQty: 10, status: "Active" },
  { id: "P-003", name: "Gas LPG 11kg", costPrice: "₱ 921.00", leadTime: "2 days", minOrderQty: 10, status: "Active" },
  { id: "P-009", name: "Gas LPG 22kg", costPrice: "₱ 1,726.00", leadTime: "2 days", minOrderQty: 10, status: "Active" },
  { id: "P-010", name: "Gasul LPG 50kg", costPrice: "₱ 3,964.00", leadTime: "3 days", minOrderQty: 10, status: "Active" },
];

const samplePurchaseOrders = [
  { id: "PO-001", date: "01/05/2026", totalQty: 20, totalAmount: "₱ 4,860.00", expectedDate: "01/07/2026", status: "Sent" },
  { id: "PO-002", date: "01/05/2026", totalQty: 20, totalAmount: "₱ 12,060.00", expectedDate: "01/07/2026", status: "Sent" },
  { id: "PO-003", date: "01/05/2026", totalQty: 30, totalAmount: "₱ 27,630.00", expectedDate: "01/07/2026", status: "Sent" },
  { id: "PO-009", date: "01/06/2026", totalQty: 20, totalAmount: "₱ 34,520.00", expectedDate: "01/08/2026", status: "Sent" },
  { id: "PO-010", date: "01/09/2026", totalQty: 10, totalAmount: "₱ 39,640.00", expectedDate: "01/12/2026", status: "Sent" },
];

const sampleDeliveryHistory = [
  { id: "SD-001", poId: "PO-001", dateDelivered: "01/07/2026", totalQty: 20, status: "Received", receivedBy: "U-001" },
  { id: "SD-002", poId: "PO-002", dateDelivered: "01/07/2026", totalQty: 20, status: "Received", receivedBy: "U-002" },
  { id: "SD-003", poId: "PO-003", dateDelivered: "01/07/2026", totalQty: 30, status: "Received", receivedBy: "U-002" },
  { id: "SD-004", poId: "PO-009", dateDelivered: "01/08/2026", totalQty: 20, status: "Received", receivedBy: "U-002" },
  { id: "SD-005", poId: "PO-010", dateDelivered: "01/12/2026", totalQty: 10, status: "Received", receivedBy: "U-001" },
];

export default function ViewSupplierModal({ isOpen, onClose, supplier }) {
  const [activeTab, setActiveTab] = useState("Supplier Products");

  if (!isOpen) return null;

  return (
    <div className="view-supplier-modal-overlay">
      <div className="view-supplier-modal-card">
        {/* Navigation Tabs */}
        <div className="supplier-modal-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "Supplier Products" ? "active" : ""}`}
            onClick={() => setActiveTab("Supplier Products")}
          >
            Supplier Products
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "Purchase Order" ? "active" : ""}`}
            onClick={() => setActiveTab("Purchase Order")}
          >
            Purchase Order
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "Delivery History" ? "active" : ""}`}
            onClick={() => setActiveTab("Delivery History")}
          >
            Delivery History
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="tab-content">
          {activeTab === "Supplier Products" && (
            <div className="view-supplier-table-wrap">
              <table className="view-supplier-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Cost Price</th>
                    <th>Lead Time</th>
                    <th>Minimum Order Qty</th>
                    <th>Product Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td>{prod.id}</td>
                      <td>{prod.name}</td>
                      <td>{prod.costPrice}</td>
                      <td>{prod.leadTime}</td>
                      <td>{prod.minOrderQty}</td>
                      <td>{prod.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Purchase Order" && (
            <div className="view-supplier-table-wrap">
              <table className="view-supplier-table">
                <thead>
                  <tr>
                    <th>Purchase Order ID</th>
                    <th>Date</th>
                    <th>Total Quantity</th>
                    <th>Total Amount</th>
                    <th>Expected Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {samplePurchaseOrders.map((po) => (
                    <tr key={po.id}>
                      <td>{po.id}</td>
                      <td>{po.date}</td>
                      <td>{po.totalQty}</td>
                      <td>{po.totalAmount}</td>
                      <td>{po.expectedDate}</td>
                      <td>{po.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Delivery History" && (
            <div className="view-supplier-table-wrap">
              <table className="view-supplier-table">
                <thead>
                  <tr>
                    <th>Delivery ID</th>
                    <th>Purchase Order ID</th>
                    <th>Date Delivered</th>
                    <th>Total Quantity</th>
                    <th>Status</th>
                    <th>Received By</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleDeliveryHistory.map((dh) => (
                    <tr key={dh.id}>
                      <td>{dh.id}</td>
                      <td>{dh.poId}</td>
                      <td>{dh.dateDelivered}</td>
                      <td>{dh.totalQty}</td>
                      <td>{dh.status}</td>
                      <td>{dh.receivedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="view-supplier-modal-actions">
          <button type="button" className="btn-modal-back" onClick={onClose}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}