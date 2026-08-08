import React from "react";
import "./ConfirmPOModal.css";

export default function ConfirmPOModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="po-modal-overlay">
      <div className="po-modal-card">
        <h2 className="po-modal-title">
          Are you sure you want to confirm this purchase order?
        </h2>
        <p className="po-modal-description">
          Once confirmed, the purchase order will be submitted and an email will
          be sent to the supplier.
        </p>

        <div className="po-modal-actions">
          <button className="po-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="po-modal-btn-confirm" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}