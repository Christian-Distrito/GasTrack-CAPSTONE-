import React from "react";
import "./AddStockOutModal.css";

export default function AddStockOutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Add Stock Out</h2>

        {/* Form Details */}
        <div className="form-grid">
          <div className="form-row">
            <span className="form-label">Stock Out ID</span>
            <span className="form-colon">:</span>
            <input type="text" className="form-input" placeholder="SO-001" />
          </div>

          <div className="form-row">
            <span className="form-label">Stock Out Type</span>
            <span className="form-colon">:</span>
            <select className="form-select" defaultValue="Supplier Return">
              <option value="Supplier Return">Supplier Return</option>
              <option value="Damaged Stock">Damaged Stock</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>

          <div className="form-row">
            <span className="form-label">Reference ID</span>
            <span className="form-colon">:</span>
            <input type="text" className="form-input" placeholder="Reference ID" />
          </div>

          <div className="form-row">
            <span className="form-label">Reason</span>
            <span className="form-colon">:</span>
            <select className="form-select" defaultValue="Damaged">
              <option value="Damaged">Damaged</option>
              <option value="Expired">Expired</option>
              <option value="Defective">Defective</option>
            </select>
          </div>

          <div className="form-row">
            <span className="form-label">Processed by</span>
            <span className="form-colon">:</span>
            <select className="form-select">
              <option value="">User Name</option>
            </select>
          </div>

          <div className="form-row">
            <span className="form-label">Date</span>
            <span className="form-colon">:</span>
            <input
              type="text"
              className="form-input"
              placeholder="01/01/2026 2:14:05 PM"
            />
          </div>

          <div className="form-row">
            <span className="form-label">Status</span>
            <span className="form-colon">:</span>
            <select className="form-select" defaultValue="Pending">
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>
        </div>

        {/* Items Section Header */}
        <div className="items-section-header">
          <h3 className="items-title">Items</h3>
          <button className="btn-add-item">Add Item</button>
        </div>

        {/* Items Table */}
        <div className="modal-table-wrap">
          <table className="modal-table">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th>Product ID</th>
                <th>Product Name</th>
                <th className="text-center">Qty</th>
                <th className="text-center">Condition</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">1</td>
                <td>P-001</td>
                <td>Gasul LPG 2.7 kg</td>
                <td className="text-center">20</td>
                <td className="text-center">Damaged</td>
                <td className="text-center">Send Back</td>
              </tr>
              <tr>
                <td className="text-center">2</td>
                <td>P-003</td>
                <td>Gasul LPG 11kg</td>
                <td className="text-center">15</td>
                <td className="text-center">Damaged</td>
                <td className="text-center">Send Back</td>
              </tr>
              <tr>
                <td className="text-center">3</td>
                <td>P-005</td>
                <td>Cylinder 7kg</td>
                <td className="text-center">15</td>
                <td className="text-center">Damaged</td>
                <td className="text-center">Send Back</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals & Notes Summary */}
        <div className="modal-summary">
          <div className="summary-row">Total Stock Out Items: 50</div>
          <div className="summary-row">Stock Deduction: 50</div>
          <div className="summary-note">
            Note: Items will be returned to supplier warehouse
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save-draft">Save Draft</button>
          <button className="btn-approved">Approved</button>
        </div>
      </div>
    </div>
  );
}