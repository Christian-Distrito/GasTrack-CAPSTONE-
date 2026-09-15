import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import AddProductModal from "./AddProductModal";
import { apiRequest } from "./api";
import "./Products.css";

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const productRows = useMemo(
    () =>
      products.map((product) => ({
        productId: product.productId,
        productName: product.name,
        category: product.category,
        supplier: product.supplier,
        costPrice: pesoFormatter.format(Number(product.costPrice || 0)),
        status: product.status,
      })),
    [products]
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    if (selectedCategory !== "All Categories") {
      params.set("category", selectedCategory);
    }
    if (selectedStatus !== "All Status") {
      params.set("status", selectedStatus);
    }

    const endpoint = params.toString() ? `/products?${params.toString()}` : "/products";

    apiRequest(endpoint)
      .then((data) => {
        setProducts(data);
        setLoadError("");
      })
      .catch((err) => {
        setProducts([]);
        setLoadError(err.message || "Failed to load products.");
      });
  }, [searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="products-page">
      <div className="products-inner">
        <h1 className="products-title">Products</h1>
        {loadError && <p className="products-error">{loadError}</p>}

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
              {productRows.map((product) => (
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

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
    </div>
  );
}
