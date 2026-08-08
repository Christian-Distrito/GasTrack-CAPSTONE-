import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import PosTerminal from "./PosTerminal";
import PaymentModal from "./PaymentModal";
import Users from "./Users";
import Inventory from "./Inventory";
import Products from "./Products";
import Restocking from "./Restocking";
import "./App.css";

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
  // sales: Sales,
  restocking: Restocking,
  // suppliers: Suppliers,
  // data: Data,
   users: Users,
  // settings: Settings,
  // report: ReportAndCompliance,
  // orders: OrderAndDelivery,
};

export default function App() {
  const [activeItem, setActiveItem] = useState("dashboard");

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
