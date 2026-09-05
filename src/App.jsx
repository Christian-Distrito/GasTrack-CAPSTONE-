import React, { useState } from "react";
import Login from "./Login";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import PosTerminal from "./PosTerminal";
import PaymentModal from "./PaymentModal";
import Sales from "./Sales";
import Users from "./Users";
import Settings from "./Settings";
import Inventory from "./Inventory";
import Products from "./Products";
import Restocking from "./Restocking";
import AddProductModal from "./AddProductModal";
import Suppliers from "./Suppliers";
import "./App.css";
import ReportCompliance from "./ReportCompliance";
import Data from "./Data";
import OrderAndDelivery from "./OrderAndDelivery";
import LogoutModal from "./LogoutModal";

// ---------------------------------------------------------------------------
// App shell — Sidebar on the left, active page on the right.
//
// As you build out more pages (POS Terminal, Inventory, Products, etc.),
// add them to the `pages` map below. The `id` values must match the `id`s
// in Sidebar.jsx's `navItems` array.
// ---------------------------------------------------------------------------

const pages = {
  dashboard: Dashboard,
  pos: PosTerminal,
  inventory: Inventory,
  products: Products,
  sales: Sales,
  restocking: Restocking,
  suppliers: Suppliers,
  data: Data,
  users: Users,
  settings: Settings,
  report: ReportCompliance,
  // orders: OrderAndDelivery,
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleLogin = async ({ username, password }) => {
    // Replace this with your real authentication call, e.g.:
    // const res = await fetch("/api/auth/login", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ username, password }),
    // });
    // if (!res.ok) throw new Error("Invalid username or password");
    console.log("Logging in with", username, password);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const ActivePage = pages[activeItem] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <main className="app-content">
        <ActivePage />
      </main>
    </div>
  );
}
