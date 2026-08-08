import React, { useState, useEffect } from "react";
import "./CustomizeRestockModal.css";

const defaultInitialItems = [
  {
    num: 1,
    restockId: "R-003",
    productId: "P-003",
    suggested: 50,
    preferred: 45,
    budget: "₱ 41,445.00",
  },
  {
    num: 2,
    restockId: "R-005",
    productId: "P-005",
    suggested: 30,
    preferred: 20,
    budget: "₱ 36,000.00",
  },
];

export default function CustomizeRestockModal({ isOpen, onClose }) {
  const [restockInputId, setRestockInputId] = useState("RI-001");
  const [supplier, setSupplier] = useState("ABC Company");
  const [items, setItems] = useState(defaultInitialItems);

  // Submodal state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({
    restockId: "",
    productId: "",
    suggested: "",
    preferred: "",
    budget: "",
  });

  useEffect(() => {
    if (isOpen) {
      setItems(defaultInitialItems);
      setIsAddItemOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenAddItemModal = () => {
    const nextNum = items.length + 1;
    setNewItemData({
      restockId: `R-00${nextNum + 5}`,
      productId: `P-00${nextNum + 5}`,
      suggested: "20",
      preferred: "15",
      budget: "15000",
    });
    setIsAddItemOpen(true);
  };

  const handleConfirmAddItem = () => {
    const nextNum = items.length + 1;
    const addedItem = {
      num: nextNum,
      restockId: newItemData.restockId || `R-00${nextNum}`,
      productId: newItemData.productId || `P-00${nextNum}`,
      suggested: Number(newItemData.suggested) || 0,
      preferred: Number(newItemData.preferred) || 0,
      budget: `₱ ${Number(newItemData.budget).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    };

    setItems((prevItems) => [...prevItems, addedItem]);
    setIsAddItemOpen(false);
  };

  return (
    <div className="customize-modal-overlay">
      <div className="customize-modal-card">
        <h2 className="customize-modal-title">Restocking Customize</h2>

        {/* Header Form */}
        <div className="customize-form-fields">
          <div className="customize-field-row">
            <label>Restock Input ID</label>
            <span className="customize-colon">:</span>
            <div className="customize-input-wrap">
              <input
                type="text"
                value={restockInputId}
                onChange={(e) => setRestockInputId(e.target.value)}
                placeholder="RI-001"
              />
            </div>
          </div>

          <div className="customize-field-row">
            <label>Supplier</label>
            <span className="customize-colon">:</span>
            <div className="customize-input-wrap">
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              >
                <option value="ABC Company">ABC Company</option>
                <option value="XYZ Inc">XYZ Inc</option>
                <option value="DEF Company">DEF Company</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="customize-divider" />

        {/* Section Header & Add Item */}
        <div className="customize-section-header">
          <h3 className="customize-section-title">Restock Items Customize</h3>
          <button
            type="button"
            className="btn-add-item"
            onClick={handleOpenAddItemModal}
          >
            Add Item
          </button>
        </div>

        {/* Items Table */}
        <div className="customize-table-wrap">
          <table className="customize-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Restock ID</th>
                <th>Product ID</th>
                <th>Suggested</th>
                <th>Preferred</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.num}>
                  <td>{item.num}</td>
                  <td>{item.restockId}</td>
                  <td>{item.productId}</td>
                  <td>{item.suggested}</td>
                  <td>{item.preferred}</td>
                  <td>{item.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr className="customize-divider" />

        {/* Action Buttons */}
        <div className="customize-modal-actions">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-modal-draft" onClick={onClose}>
            Save Draft
          </button>
          <button type="button" className="btn-modal-apply" onClick={onClose}>
            Apply
          </button>
        </div>
      </div>

      {/* Add Item Sub-modal */}
      {isAddItemOpen && (
        <div className="add-item-submodal-overlay">
          <div className="add-item-submodal-card">
            <h3 className="add-item-submodal-title">Add Restock Item</h3>

            <div className="add-item-form">
              <div className="add-item-field">
                <label>Restock ID</label>
                <input
                  type="text"
                  value={newItemData.restockId}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, restockId: e.target.value })
                  }
                />
              </div>

              <div className="add-item-field">
                <label>Product ID</label>
                <input
                  type="text"
                  value={newItemData.productId}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, productId: e.target.value })
                  }
                />
              </div>

              <div className="add-item-field">
                <label>Suggested Qty</label>
                <input
                  type="number"
                  value={newItemData.suggested}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, suggested: e.target.value })
                  }
                />
              </div>

              <div className="add-item-field">
                <label>Preferred Qty</label>
                <input
                  type="number"
                  value={newItemData.preferred}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, preferred: e.target.value })
                  }
                />
              </div>

              <div className="add-item-field">
                <label>Budget (₱)</label>
                <input
                  type="text"
                  value={newItemData.budget}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, budget: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="add-item-submodal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setIsAddItemOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-apply"
                onClick={handleConfirmAddItem}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}