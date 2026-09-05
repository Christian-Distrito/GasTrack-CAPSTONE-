import React, { useState } from "react";
import {
  LayoutGrid,
  ShoppingCart,
  Boxes,
  Package,
  DollarSign,
  RotateCcw,
  Users,
  Database,
  User,
  Settings,
  FileText,
  Truck,
  Search,
  Bell,
  UserCircle,
} from "lucide-react";

// Import your custom logo image
import logoImg from "./assets/logo.png";
import "./Sidebar.css";

// ---------------------------------------------------------------------------
// Nav config — edit this array to add/remove/reorder tabs
// ---------------------------------------------------------------------------

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "pos", label: "POS Terminal", icon: ShoppingCart },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "products", label: "Products", icon: Package },
  { id: "sales", label: "Sales", icon: DollarSign },
  { id: "restocking", label: "Restocking", icon: RotateCcw },
  { id: "orders", label: "Order and Delivery", icon: Truck },
  { id: "suppliers", label: "Suppliers", icon: Users },
  { id: "report", label: "Report and Compliance", icon: FileText },
  { id: "data", label: "Data", icon: Database },
  { id: "users", label: "Users", icon: User },
  { id: "settings", label: "Settings", icon: Settings },  
];

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

export default function Sidebar({ activeItem, onNavigate, onProfileClick, notificationCount = 9 }) {
  // Falls back to internal state if the parent doesn't control activeItem
  const [internalActive, setInternalActive] = useState("dashboard");
  const current = activeItem ?? internalActive;

  const handleClick = (id) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      setInternalActive(id);
    }
  };

  return (
    <aside className="sidebar">
      {/* Custom Image Logo */}
      <div className="sidebar-logo">
        <img src={logoImg} alt="GasTrack Logo" className="sidebar-logo-img" />
      </div>

      {/* Avatar + notification bell */}
      <div className="sidebar-top-icons">
        <button type="button" className="icon-circle" aria-label="Profile">
          <UserCircle size={20} />
        </button>
        <button type="button" className="icon-circle" aria-label="Notifications">
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <Search size={16} className="sidebar-search-icon" />
        <input type="text" placeholder="Search for..." className="sidebar-search-input" />
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sidebar-nav-item ${current === id ? "active" : ""}`}
            onClick={() => handleClick(id)}
          >
            <Icon size={18} className="sidebar-nav-icon" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
