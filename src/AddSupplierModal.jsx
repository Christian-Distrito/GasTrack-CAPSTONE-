import React, { useState, useEffect } from "react";
import "./AddSupplierModal.css";

export default function AddSupplierModal({ isOpen, onClose, selectedSupplier, onSave }) {
  const [formData, setFormData] = useState({
    supplierId: "S-001",
    fullName: "",
    supplierType: "Manufacturer",
    defaultLeadTime: "",
    status: "Active",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });

  // Dynamic button label based on mode
  const isEditing = Boolean(selectedSupplier);
  const submitButtonLabel = isEditing ? "Save" : "Add";

  useEffect(() => {
    if (selectedSupplier) {
      setFormData({
        supplierId: selectedSupplier.id || "S-001",
        fullName: selectedSupplier.name || "",
        supplierType: selectedSupplier.type || "Manufacturer",
        defaultLeadTime: selectedSupplier.leadTime || "",
        status: selectedSupplier.status || "Active",
        contactPerson: selectedSupplier.contactPerson || "",
        email: selectedSupplier.email || "",
        phone: selectedSupplier.phone || "",
        address: selectedSupplier.address || "",
      });
    } else {
      setFormData({
        supplierId: "S-001",
        fullName: "",
        supplierType: "Manufacturer",
        defaultLeadTime: "",
        status: "Active",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [selectedSupplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave({ ...formData, isEditing });
    onClose();
  };

  return (
    <div className="supplier-modal-overlay">
      <div className="supplier-modal-card">
        <h2 className="supplier-modal-title">Supplier Information</h2>

        <form className="supplier-form" onSubmit={handleSubmit}>
          {/* BASIC INFORMATION */}
          <div className="supplier-section-header">BASIC INFORMATION</div>

          <div className="form-row-2-1">
            <div className="form-field">
              <label>Supplier ID</label>
              <input
                type="text"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                placeholder="S-001"
              />
            </div>
            <div className="form-field">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="ABC Company"
              />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-field">
              <label>Supplier Type</label>
              <select
                value={formData.supplierType}
                onChange={(e) => setFormData({ ...formData, supplierType: e.target.value })}
              >
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Wholesaler">Wholesaler</option>
              </select>
            </div>
            <div className="form-field">
              <label>Default Lead Times</label>
              <input
                type="text"
                value={formData.defaultLeadTime}
                onChange={(e) => setFormData({ ...formData, defaultLeadTime: e.target.value })}
                placeholder="Enter Number"
              />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="supplier-section-header">CONTACT INFORMATION</div>

          <div className="form-row-equal">
            <div className="form-field">
              <label>Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Juan Dela Cruz"
              />
            </div>
            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="abccompany@supplier.com"
              />
            </div>
          </div>

          <div className="form-row-equal">
            <div className="form-field">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="09875412558"
              />
            </div>
            <div className="form-field">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="146 Makinang Manila City"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="supplier-modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit">
              {submitButtonLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}