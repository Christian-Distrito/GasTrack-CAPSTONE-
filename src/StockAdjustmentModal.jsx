import React from "react";
import "./StockAdjustmentModal.css";

export default function StockAdjustmentModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Stock Adjustment</h2>

        {/* Form Grid */}
        <div className="form-grid">
          <div className="form-row">
            <span className="form-label">Stock In ID</span>
            <span className="form-colon">:</span>
            <input type="text" className="form-input" placeholder="SI-001" />
          </div>

          <div className="form-row">
            <span className="form-label">Supplier</span>
            <span className="form-colon">:</span>
            <select className="form-select">
              <option value="">Supplier Name</option>
            </select>
          </div>

          <div className="form-row">
            <span className="form-label">Invoice No</span>
            <span className="form-colon">:</span>
            <input type="text" className="form-input" placeholder="INV-001" />
          </div>

          <div className="form-row">
            <span className="form-label">Received by</span>
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
            <select className="form-select" defaultValue="Completed">
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Adjust Items Header */}
        <div className="items-section-header">
          <h3 className="items-title">Adjust Items</h3>
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
                <th className="text-right">Cost Price</th>
                <th className="text-center">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-center">1</td>
                <td>P-001</td>
                <td>Gasul LPG 2.7 kg</td>
                <td className="text-center">10</td>
                <td className="text-right">₱ 4,860.00</td>
                <td className="text-center">01/01/2027</td>
              </tr>
              <tr>
                <td className="text-center">2</td>
                <td>P-003</td>
                <td>Gasul LPG 11kg</td>
                <td className="text-center">15</td>
                <td className="text-right">₱ 13,815.00</td>
                <td className="text-center">01/01/2027</td>
              </tr>
              <tr>
                <td className="text-center">3</td>
                <td>P-005</td>
                <td>Cylinder 7kg</td>
                <td className="text-center">15</td>
                <td className="text-right">₱ 27.000.00</td>
                <td className="text-center">01/01/2027</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="modal-summary">
          <div className="summary-row">Product ID P-001 Items: 10</div>
          <div className="summary-row">Product ID P-003 Items: 15</div>
          <div className="summary-row">Product ID P-005 Items: 15</div>
          <div className="summary-row total">Total Items: 40</div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save-draft">Save Draft</button>
          <button className="btn-adjust">Adjust</button>
        </div>
      </div>
    </div>
  );
}