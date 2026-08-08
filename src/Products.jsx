import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import AddProductModal from "./AddProductModal";
import "./Products.css";

const initialProducts = [
  {
    productId: "P-001",
    productName: "Gas LPG 2.7kg",
    category: "Gasul LPG",
    supplier: "ABC Company",
    costPrice: "₱ 243.00",
    status: "Active",
  },
  {
    productId: "P-004",
    productName: "Cylinder 2.7kg",
    category: "Cylinder",
    supplier: "XYZ Inc",
    costPrice: "₱ 1,000.00",
    status: "Active",
  },
  {
    productId: "P-005",
    productName: "POL Regulator",
    category: "Accessories",
    supplier: "DEF Company",
    costPrice: "₱ 550.00",
    status: "Active",
  },
  {
    productId: "P-006",
    productName: "LPG Hose",
    category: "Accessories",
    supplier: "XYZ Inc",
    costPrice: "₱ 105.00",
    status: "Active",
  },
  {
    productId: "P-003",
    productName: "Gasul LPG 11kg",
    category: "Gasul LPG",
    supplier: "ABC Company",
    costPrice: "₱ 907.00",
    status: "Active",
  },
];

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  return (
    <div className="products-page">
      <div className="products-inner">
        <h1 className="products-title">Products</h1>

        {/* Toolbar Controls */}
        <div className="products-toolbar">
          <div className="products-search">
            <input
              type="text"
              placeholder="Search Product"
              className="products-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={16} className="products-search-icon" />
          </div>

          <div className="products-select-wrap">
            <select
              className="products-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All Categories">All Categories</option>
              <option value="Gasul LPG">Gasul LPG</option>
              <option value="Cylinder">Cylinder</option>
              <option value="Accessories">Accessories</option>
            </select>
            <ChevronDown size={16} className="products-select-icon" />
          </div>

          <div className="products-select-wrap">
            <select
              className="products-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={16} className="products-select-icon" />
          </div>

          <button
            className="add-product-btn"
            onClick={() => setIsAddProductOpen(true)}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Table Container */}
        <div className="products-table-wrap">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Cost Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialProducts.map((product) => (
                <tr key={product.productId}>
                  <td>{product.productId}</td>
                  <td>{product.productName}</td>
                  <td>{product.category}</td>
                  <td>{product.supplier}</td>
                  <td>{product.costPrice}</td>
                  <td>
                    <span
                      className={`products-status-pill ${product.status.toLowerCase()}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="products-action-icons">
                      <button className="products-action-icon view" title="View">
                        <FileText size={16} />
                      </button>
                      <button className="products-action-icon edit" title="Edit">
                        <Pencil size={16} />
                      </button>
                      <button className="products-action-icon delete" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pop-up Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
}