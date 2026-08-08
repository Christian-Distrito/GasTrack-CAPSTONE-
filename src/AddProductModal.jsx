import React from "react";
import "./AddProductModal.css"; // Ensure this import is present!

export default function AddProductModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="add-product-modal-overlay">
      <div className="add-product-modal-card">
        <h2 className="add-product-title">Product information</h2>

        <form className="add-product-form" onSubmit={(e) => e.preventDefault()}>
          {/* Row 1 */}
          <div className="form-row-2">
            <div className="form-field">
              <label>Product ID</label>
              <input type="text" placeholder="P-001" />
            </div>
            <div className="form-field">
              <label>Product Name</label>
              <input type="text" placeholder="Name" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="form-row-2">
            <div className="form-field">
              <label>Category</label>
              <select defaultValue="">
                <option value="" disabled hidden>Category</option>
                <option value="Cat1">Gasul LPG</option>
                <option value="Cat2">Cylinder</option>
                <option value="Cat3">Accessories</option>
              </select>
            </div>
            <div className="form-field">
              <label>Supplier</label>
              <select defaultValue="">
                <option value="" disabled hidden>Supplier</option>
                <option value="Sup1">ABC Company</option>
                <option value="Sup2">XYZ Inc</option>
                <option value="Sup3">DEF Company</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="form-row-3">
            <div className="form-field">
              <label>Unit</label>
              <select defaultValue="">
                <option value="" disabled hidden>Unit</option>
                <option value="Kilogram">Kilogram</option>
                <option value="Meter">Meter</option>
                <option value="Item">Item</option>
              </select>
            </div>
            <div className="form-field">
              <label>Unit Price</label>
              <input type="text" placeholder="₱ 0.00" />
            </div>
            <div className="form-field">
              <label>Cost Price</label>
              <input type="text" placeholder="₱ 0.00" />
            </div>
          </div>

          {/* Row 4 */}
          <div className="form-row-2">
            <div className="form-field">
              <label>Reorder Level</label>
              <input type="text" placeholder="Enter Number" />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select defaultValue="Active">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Row 5 */}
          <div className="form-field">
            <label>AR Model URL</label>
            <input type="text" placeholder="URL link" />
          </div>

          {/* Row 6: Image Upload */}
          <div className="form-field-inline">
            <label>Image Upload:</label>
            <button type="button" className="btn-file-upload">Attached File</button>
          </div>

          {/* Actions */}
          <div className="add-product-modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-add">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}