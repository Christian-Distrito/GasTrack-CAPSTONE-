import React, { useState } from "react";
import { Search, ChevronDown, Plus, FileText, Edit, Trash2 } from "lucide-react";
import AddSupplierModal from "./AddSupplierModal";
import ViewSupplierModal from "./ViewSupplierModal";
import "./Suppliers.css";

const initialSuppliers = [
  {
    id: "S-001",
    name: "ABC Company",
    contactPerson: "Juan",
    phone: "0956478512354",
    address: "#59 Kahoy St",
    status: "Active",
  },
  {
    id: "S-002",
    name: "XYZ Inc",
    contactPerson: "Juan",
    phone: "0956478512354",
    address: "#59 Kahoy St",
    status: "Active",
  },
  {
    id: "S-003",
    name: "DEF Company",
    contactPerson: "Juan",
    phone: "0956478512354",
    address: "#59 Kahoy St",
    status: "Inactive",
  },
  {
    id: "S-004",
    name: "NOV Inc",
    contactPerson: "Juan",
    phone: "0956478512354",
    address: "#59 Kahoy St",
    status: "Active",
  },
  {
    id: "S-005",
    name: "POW Co",
    contactPerson: "Juan",
    phone: "0956478512354",
    address: "#59 Kahoy St",
    status: "Inactive",
  },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("All Performance");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [locationFilter, setLocationFilter] = useState("All Locations");

  // Modal Control States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Open Modal for "Add Supplier"
  const handleOpenAddModal = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  // Open Modal for "Edit Supplier"
  const handleOpenEditModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  // Open Modal for "View Details"
  const handleOpenViewModal = (supplier) => {
    setSelectedSupplier(supplier);
    setIsViewModalOpen(true);
  };

  // Save/Update Handler
  const handleSaveSupplier = (data) => {
    if (data.isEditing) {
      setSuppliers((prev) =>
        prev.map((item) =>
          item.id === data.supplierId
            ? {
                ...item,
                name: data.fullName,
                contactPerson: data.contactPerson,
                phone: data.phone,
                address: data.address,
                status: data.status,
              }
            : item
        )
      );
    } else {
      const newSupplier = {
        id: data.supplierId || `S-00${suppliers.length + 1}`,
        name: data.fullName || "New Supplier",
        contactPerson: data.contactPerson || "N/A",
        phone: data.phone || "N/A",
        address: data.address || "N/A",
        status: data.status || "Active",
      };
      setSuppliers((prev) => [...prev, newSupplier]);
    }
  };

  return (
    <div className="suppliers-page">
      <h1 className="suppliers-title">Suppliers</h1>

      {/* Toolbar Controls */}
      <div className="suppliers-toolbar">
        <div className="suppliers-search-wrap">
          <input
            type="text"
            className="suppliers-search-input"
            placeholder="Search by Supplier Name, ID or Contact Person"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search size={18} className="suppliers-search-icon" />
        </div>

        <div className="suppliers-select-wrap">
          <select
            className="suppliers-select"
            value={performanceFilter}
            onChange={(e) => setPerformanceFilter(e.target.value)}
          >
            <option value="All Performance">All Performance</option>
          </select>
          <ChevronDown size={16} className="suppliers-select-icon" />
        </div>

        <div className="suppliers-select-wrap">
          <select
            className="suppliers-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <ChevronDown size={16} className="suppliers-select-icon" />
        </div>

        <div className="suppliers-select-wrap">
          <select
            className="suppliers-select"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="All Locations">All Locations</option>
          </select>
          <ChevronDown size={16} className="suppliers-select-icon" />
        </div>

        <button 
          type="button" 
          className="btn-add-supplier" 
          onClick={handleOpenAddModal}
        >
          <Plus size={18} /> Add Supplier
        </button>
      </div>

      {/* Table Section */}
      <div className="suppliers-section-title">Supplier List</div>

      <div className="suppliers-table-wrap">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.contactPerson}</td>
                <td>{item.phone}</td>
                <td>{item.address}</td>
                <td>
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="suppliers-actions-cell">
                    <button
                      type="button"
                      className="action-icon-btn view"
                      title="View Details"
                      onClick={() => handleOpenViewModal(item)}
                    >
                      <FileText size={18} />
                    </button>
                    <button
                      type="button"
                      className="action-icon-btn edit"
                      title="Edit Supplier"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      <Edit size={18} />
                    </button>
                    <button type="button" className="action-icon-btn delete" title="Delete Supplier">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Supplier Pop-up Window */}
      <AddSupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedSupplier={selectedSupplier}
        onSave={handleSaveSupplier}
      />

      {/* View Supplier Details Pop-up Window */}
      <ViewSupplierModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        supplier={selectedSupplier}
      />
    </div>
  );
}