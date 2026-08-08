import React, { useState, useEffect } from "react";
import "./CustomizeSingleItemModal.css";

export default function CustomizeSingleItemModal({ isOpen, onClose, selectedItem, onSave }) {
  const [formData, setFormData] = useState({
    restockId: "",
    restockInputId: "",
    productId: "",
    budgetLimit: "",
    preferredQty: "",
  });

  useEffect(() => {
    if (selectedItem) {
      setFormData({
        restockId: selectedItem.restockId || "",
        restockInputId: "",
        productId: selectedItem.productId || "",
        budgetLimit: "",
        preferredQty: "",
      });
    }
  }, [selectedItem]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
    onClose();
  };

  return (
    <div className="single-item-modal-overlay">
      <div className="single-item-modal-card">
        <h2 className="single-item-modal-title">Restocking Customize</h2>

        <form onSubmit={handleSubmit} className="single-item-form-grid">
          {/* Row 1: Restock ID & RestockInputID */}
          <div className="single-item-row">
            <div className="single-item-field">
              <label>Restock ID</label>
              <input
                type="text"
                value={formData.restockId}
                onChange={(e) => setFormData({ ...formData, restockId: e.target.value })}
                placeholder="R-001"
              />
            </div>
            <div className="single-item-field">
              <label>RestockInputID</label>
              <input
                type="text"
                value={formData.restockInputId}
                onChange={(e) => setFormData({ ...formData, restockInputId: e.target.value })}
                placeholder="ID"
              />
            </div>
          </div>

          {/* Row 2: Product ID */}
          <div className="single-item-field">
            <label>Product ID</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            >
              <option value="" disabled hidden>
                Product ID
              </option>
              <option value="P-001">P-001</option>
              <option value="P-002">P-002</option>
              <option value="P-003">P-003</option>
              <option value="P-004">P-004</option>
              <option value="P-005">P-005</option>
            </select>
          </div>

          {/* Row 3: Budget Limit & Preferred Order Quantity */}
          <div className="single-item-row">
            <div className="single-item-field">
              <label>Budget Limit</label>
              <input
                type="text"
                value={formData.budgetLimit}
                onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                placeholder="₱ 0.00"
              />
            </div>
            <div className="single-item-field">
              <label>Preferred Order Quantity</label>
              <input
                type="number"
                value={formData.preferredQty}
                onChange={(e) => setFormData({ ...formData, preferredQty: e.target.value })}
                placeholder="Enter Number"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="single-item-modal-actions">
            <button type="button" className="btn-single-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-single-save">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}