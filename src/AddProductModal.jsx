import React from "react";
import "./AddProductModal.css";

export default function AddProductModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Product information</h2>

        <div className="product-form-grid">
          {/* Row 1: Product ID & Product Name */}
          <div className="form-row-2">
            <div className="form-group">
              <label>Product ID</label>
              <input type="text" placeholder="P-001" />
            </div>
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" placeholder="Name" />
            </div>
          </div>

          {/* Row 2: Category & Supplier */}
          <div className="form-row-equal-2">
            <div className="form-group">
              <label>Category</label>
              <select defaultValue="">
                <option value="" disabled hidden>Category</option>
                <option value="Gasul LPG">Gasul LPG</option>
                <option value="Cylinder">Cylinder</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select defaultValue="">
                <option value="" disabled hidden>Supplier</option>
                <option value="ABC Company">ABC Company</option>
                <option value="XYZ Inc">XYZ Inc</option>
                <option value="DEF Company">DEF Company</option>
              </select>
            </div>
          </div>

          {/* Row 3: Unit, Unit Price, Cost Price */}
          <div className="form-row-3">
            <div className="form-group">
              <label>Unit</label>
              <select defaultValue="">
                <option value="" disabled hidden>Unit</option>
                <option value="Kilogram">Kilogram</option>
                <option value="Meter">Meter</option>
                <option value="Item">Item</option>
              </select>
            </div>
            <div className="form-group">
              <label>Unit Price</label>
              <input type="text" placeholder="₱ 0.00" />
            </div>
            <div className="form-group">
              <label>Cost Price</label>
              <input type="text" placeholder="₱ 0.00" />
            </div>
          </div>

          {/* Row 4: Reorder Level & Status */}
          <div className="form-row-equal-2">
            <div className="form-group">
              <label>Reorder Level</label>
              <input type="text" placeholder="Enter Number" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select defaultValue="Active">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Row 5: AR Model URL */}
          <div className="form-group">
            <label>AR Model URL</label>
            <input type="text" placeholder="url link" />
          </div>

          {/* Row 6: Image Upload */}
          <div className="file-upload-row">
            <label>Image Upload:</label>
            <button type="button" className="btn-attach-file">
              Attached File
            </button>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="product-modal-actions">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-modal-add">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}