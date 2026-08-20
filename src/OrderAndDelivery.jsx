import { useState } from "react";
import "./OrderAndDelivery.css";

/* ---------------------------------------------------------
   Seed data
--------------------------------------------------------- */
const initialCustomers = [
  { id: "C-001", name: "John Sustar Yosep", phone: "09787654475", address: "590 Marilaw Manila City", created: "01/01/2026", updated: "01/01/2026" },
  { id: "C-002", name: "Guest", phone: "", address: "None", created: "01/01/2026", updated: "01/01/2026" },
  { id: "C-003", name: "Maria", phone: "09754564475", address: "142 Antipolo City", created: "01/01/2026", updated: "01/01/2026" },
  { id: "C-004", name: "Jeni", phone: "09787654475", address: "45 Fori San Juan City", created: "01/01/2026", updated: "01/01/2026" },
  { id: "C-005", name: "Juan", phone: "09787654475", address: "67 Wayoling Pasig City", created: "01/01/2026", updated: "01/01/2026" },
];

const initialOrders = [
  { id: "O-001", customerId: "C-001", type: "Delivery", status: "Preparing", paymentStatus: "Unpaid", date: "01/01/2026 2:15:05 PM",
    items: [{ name: "Gasul LPG 2.7kg", qty: 1, cost: 243.0 }], deliveryFee: 40.0,
    paymentId: "PM-001", paymentMethod: "Cash on Delivery", deliveryId: "D-001", deliveryRider: "", deliveryStatus: "Pending" },
  { id: "O-002", customerId: "C-002", type: "Walk-in", status: "Completed", paymentStatus: "Paid", date: "01/01/2026",
    items: [{ name: "Gasul LPG 11kg", qty: 1, cost: 1800.0 }], deliveryFee: 0,
    paymentId: "PM-002", paymentMethod: "Cash", deliveryId: "D-002", deliveryRider: "U-002", deliveryStatus: "Delivered", deliveredAt: "01/01/2026" },
  { id: "O-003", customerId: "C-003", type: "Delivery", status: "Ready", paymentStatus: "Unpaid", date: "01/01/2026",
    items: [{ name: "Gasul LPG 2.7kg", qty: 1, cost: 248.0 }], deliveryFee: 40.0,
    paymentId: "PM-003", paymentMethod: "Cash on Delivery", deliveryId: "D-003", deliveryRider: "U-003", deliveryStatus: "Out for Delivery" },
  { id: "O-004", customerId: "C-004", type: "Walk-in", status: "Completed", paymentStatus: "Paid", date: "01/01/2026",
    items: [{ name: "Gasul LPG 11kg", qty: 1, cost: 1800.0 }], deliveryFee: 0,
    paymentId: "PM-004", paymentMethod: "Cash", deliveryId: "D-004", deliveryRider: "U-004", deliveryStatus: "Delivered", deliveredAt: "01/01/2026" },
  { id: "O-005", customerId: "C-005", type: "Pickup", status: "Ready", paymentStatus: "Unpaid", date: "01/01/2026",
    items: [{ name: "Gasul LPG 2.7kg", qty: 1, cost: 248.0 }], deliveryFee: 40.0,
    paymentId: "PM-005", paymentMethod: "Cash on Delivery", deliveryId: "D-005", deliveryRider: "U-005", deliveryStatus: "Out for Delivery" },
];

const NAV_ITEMS = [
  { label: "Dashboard", icon: "📊" },
  { label: "POS Terminal", icon: "🖥️" },
  { label: "Inventory", icon: "📦" },
  { label: "Products", icon: "🛢️" },
  { label: "Sales", icon: "💵" },
  { label: "Restocking", icon: "🔁" },
  { label: "Suppliers", icon: "🚚" },
  { label: "Data", icon: "🗄️" },
  { label: "Users", icon: "👥" },
  { label: "Settings", icon: "⚙️" },
  { label: "Report and Compliance", icon: "📋" },
  { label: "Order and Delivery", icon: "🚛", active: true },
];

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const peso = (n) =>
  "₱" + Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const subtotalOf = (order) => order.items.reduce((s, it) => s + it.qty * it.cost, 0);
const totalOf = (order) => subtotalOf(order) + (order.deliveryFee || 0);
const totalItemsOf = (order) => order.items.reduce((s, it) => s + it.qty, 0);

function nextId(prefix, list) {
  const nums = list.map((x) => parseInt(String(x.id).split("-")[1], 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

function todayStr() {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

const orderStatusClass = {
  Preparing: "badge-yellow",
  Ready: "badge-blue",
  Completed: "badge-green",
  Cancelled: "badge-red",
};
const paymentStatusClass = {
  Paid: "badge-green",
  Unpaid: "badge-red",
  Refunded: "badge-gray",
};
const deliveryStatusClass = {
  Pending: "badge-yellow",
  "Out for Delivery": "badge-blue",
  Delivered: "badge-green",
  Failed: "badge-red",
};

function Badge({ text, map }) {
  return <span className={`badge ${map[text] || "badge-gray"}`}>{text}</span>;
}

function Field({ label, children }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className={bold ? "grand" : ""}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ---------------------------------------------------------
   Main component
--------------------------------------------------------- */
export default function OrderAndDelivery() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [orders, setOrders] = useState(initialOrders);
  const [tab, setTab] = useState("orders");

  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersStatusFilter, setOrdersStatusFilter] = useState("");
  const [ordersFulfillmentFilter, setOrdersFulfillmentFilter] = useState("");
  const [deliverySearch, setDeliverySearch] = useState("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("");
  const [customersSearch, setCustomersSearch] = useState("");

  const [orderModal, setOrderModal] = useState(null);
  const [customerModal, setCustomerModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg) {
    setToastMsg(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToastMsg(""), 2200);
  }

  const findCustomer = (id) => customers.find((c) => c.id === id);

  /* ------------------- Orders ------------------- */
  const filteredOrders = orders.filter((o) => {
    const cust = findCustomer(o.customerId);
    const custName = cust ? cust.name : "";
    const q = ordersSearch.trim().toLowerCase();
    const matchesSearch = !q || o.id.toLowerCase().includes(q) || custName.toLowerCase().includes(q);
    const matchesStatus = !ordersStatusFilter || o.status === ordersStatusFilter;
    const matchesFulfillment = !ordersFulfillmentFilter || o.type === ordersFulfillmentFilter;
    return matchesSearch && matchesStatus && matchesFulfillment;
  });

  function openOrder(order) {
    setOrderModal({ ...order, items: order.items.map((it) => ({ ...it })) });
  }
  function saveOrder() {
    setOrders((prev) => prev.map((o) => (o.id === orderModal.id ? { ...orderModal } : o)));
    showToast(`Order ${orderModal.id} saved.`);
    setOrderModal(null);
  }
  function deleteOrder(id) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    showToast(`Order ${id} deleted.`);
    setConfirmDelete(null);
  }

  /* ------------------- Delivery (derived) ------------------- */
  const deliveryRows = orders
    .filter((o) => o.type === "Delivery" && o.deliveryId)
    .map((o) => ({
      deliveryId: o.deliveryId,
      orderId: o.id,
      userId: o.deliveryRider || "—",
      status: o.deliveryStatus || "Pending",
      deliveredAt: o.deliveryStatus === "Delivered" ? o.deliveredAt || o.date : "N/A",
      order: o,
    }));

  const filteredDelivery = deliveryRows.filter((d) => {
    const q = deliverySearch.trim().toLowerCase();
    const matchesSearch = !q || d.deliveryId.toLowerCase().includes(q) || d.orderId.toLowerCase().includes(q);
    const matchesStatus = !deliveryStatusFilter || d.status === deliveryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  /* ------------------- Customers ------------------- */
  const filteredCustomers = customers.filter((c) => {
    const q = customersSearch.trim().toLowerCase();
    return !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
  });

  function openAddCustomer() {
    setCustomerModal({ id: nextId("C", customers), name: "", phone: "", address: "", isNew: true });
  }
  function openEditCustomer(c) {
    setCustomerModal({ ...c, isNew: false });
  }
  function saveCustomer() {
    if (!customerModal.name.trim()) {
      showToast("Customer name is required.");
      return;
    }
    if (customerModal.isNew) {
      setCustomers((prev) => [
        ...prev,
        { id: customerModal.id, name: customerModal.name.trim(), phone: customerModal.phone.trim(), address: customerModal.address.trim(), created: todayStr(), updated: todayStr() },
      ]);
      showToast(`Customer ${customerModal.id} added.`);
    } else {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerModal.id
            ? { ...c, name: customerModal.name.trim(), phone: customerModal.phone.trim(), address: customerModal.address.trim(), updated: todayStr() }
            : c
        )
      );
      showToast(`Customer ${customerModal.id} updated.`);
    }
    setCustomerModal(null);
  }
  function deleteCustomer(id) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast(`Customer ${id} deleted.`);
    setConfirmDelete(null);
  }

  /* ------------------- Render ------------------- */
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🔥</span>
          <span className="brand-name">GasTrack</span>
        </div>

        <div className="sidebar-user">
          <span className="avatar">👤</span>
          <span className="bell">
            🔔<span className="bell-dot" />
          </span>
        </div>

        <div className="sidebar-search">
          <input type="text" placeholder="Search for..." />
          <span className="icon">🔍</span>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map(({ label, icon, active }) => (
            <a key={label} href="#" onClick={(e) => e.preventDefault()} className={`nav-item ${active ? "active" : ""}`}>
              <span className="nav-icon">{icon}</span>
              {label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="main">
        <h1 className="page-title">Order and Delivery</h1>

        <div className="panel">
          <div className="panel-header">
            <h2>Order and Delivery</h2>
            {tab === "customers" && (
              <button className="btn btn-primary" onClick={openAddCustomer}>
                + Add Customer
              </button>
            )}
          </div>

          <div className="tabs">
            {[
              { id: "orders", label: "Orders" },
              { id: "delivery", label: "Delivery" },
              { id: "customers", label: "Customers" },
            ].map((t) => (
              <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ORDERS TAB */}
          {tab === "orders" && (
            <section className="tab-panel active">
              <div className="filters">
                <div className="search-box">
                  <input value={ordersSearch} onChange={(e) => setOrdersSearch(e.target.value)} placeholder="Search Orders" />
                  <span className="icon">🔍</span>
                </div>
                <select value={ordersStatusFilter} onChange={(e) => setOrdersStatusFilter(e.target.value)}>
                  <option value="">Order Status</option>
                  <option>Preparing</option>
                  <option>Ready</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
                <select value={ordersFulfillmentFilter} onChange={(e) => setOrdersFulfillmentFilter(e.target.value)}>
                  <option value="">Fulfillment Type</option>
                  <option>Delivery</option>
                  <option>Walk-in</option>
                  <option>Pickup</option>
                </select>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Order Type</th>
                      <th>Order Status</th>
                      <th>Payment Status</th>
                      <th>Total Amount</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => {
                      const cust = findCustomer(o.customerId);
                      return (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{cust ? cust.name : "—"}</td>
                          <td>{o.type}</td>
                          <td><Badge text={o.status} map={orderStatusClass} /></td>
                          <td><Badge text={o.paymentStatus} map={paymentStatusClass} /></td>
                          <td>{peso(totalOf(o))}</td>
                          <td>{o.date}</td>
                          <td className="actions">
                            <button className="action-btn act-view" onClick={() => openOrder(o)} title="View">👁️</button>
                            <button className="action-btn act-edit" onClick={() => openOrder(o)} title="Edit">✏️</button>
                            <button className="action-btn act-delete" onClick={() => setConfirmDelete({ kind: "order", id: o.id })} title="Delete">🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && <p className="empty-state">No orders match your search.</p>}
              </div>
            </section>
          )}

          {/* DELIVERY TAB */}
          {tab === "delivery" && (
            <section className="tab-panel active">
              <div className="filters">
                <div className="search-box">
                  <input value={deliverySearch} onChange={(e) => setDeliverySearch(e.target.value)} placeholder="Search Delivery ID" />
                  <span className="icon">🔍</span>
                </div>
                <select value={deliveryStatusFilter} onChange={(e) => setDeliveryStatusFilter(e.target.value)}>
                  <option value="">Delivery Status</option>
                  <option>Pending</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Failed</option>
                </select>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Delivery ID</th>
                      <th>Order ID</th>
                      <th>User ID</th>
                      <th>Delivery Status</th>
                      <th>Delivered At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDelivery.map((d) => (
                      <tr key={d.deliveryId}>
                        <td>{d.deliveryId}</td>
                        <td>{d.orderId}</td>
                        <td>{d.userId}</td>
                        <td><Badge text={d.status} map={deliveryStatusClass} /></td>
                        <td>{d.deliveredAt}</td>
                        <td className="actions">
                          <button className="action-btn act-view" onClick={() => openOrder(d.order)} title="View">👁️</button>
                          <button className="action-btn act-edit" onClick={() => openOrder(d.order)} title="Edit">✏️</button>
                          <button className="action-btn act-delete" onClick={() => setConfirmDelete({ kind: "order", id: d.orderId })} title="Delete">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredDelivery.length === 0 && <p className="empty-state">No deliveries match your search.</p>}
              </div>
            </section>
          )}

          {/* CUSTOMERS TAB */}
          {tab === "customers" && (
            <section className="tab-panel active">
              <div className="filters">
                <div className="search-box">
                  <input value={customersSearch} onChange={(e) => setCustomersSearch(e.target.value)} placeholder="Search Customer ID" />
                  <span className="icon">🔍</span>
                </div>
                <select defaultValue="">
                  <option value="">All Pickup Status</option>
                </select>
                <select defaultValue="">
                  <option value="">All Pickup Type</option>
                </select>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Customer Name</th>
                      <th>Phone Number</th>
                      <th>Address</th>
                      <th>Created At</th>
                      <th>Updated At</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.id}</td>
                        <td>{c.name}</td>
                        <td>{c.phone || "—"}</td>
                        <td>{c.address || "—"}</td>
                        <td>{c.created}</td>
                        <td>{c.updated}</td>
                        <td className="actions">
                          <button className="action-btn act-edit" onClick={() => openEditCustomer(c)} title="Edit">✏️</button>
                          <button className="action-btn act-delete" onClick={() => setConfirmDelete({ kind: "customer", id: c.id })} title="Delete">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCustomers.length === 0 && <p className="empty-state">No customers match your search.</p>}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* ---------------- ORDER DETAILS MODAL ---------------- */}
      {orderModal && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setOrderModal(null)}>
          <div className="modal">
            <h3>Order Details</h3>

            <Field label="Order ID">
              <input disabled value={orderModal.id} />
            </Field>
            <Field label="Order Type">
              <select value={orderModal.type} onChange={(e) => setOrderModal({ ...orderModal, type: e.target.value })}>
                <option>Delivery</option>
                <option>Walk-in</option>
                <option>Pickup</option>
              </select>
            </Field>
            <Field label="Date">
              <input disabled value={orderModal.date} />
            </Field>
            <Field label="Order Status">
              <select value={orderModal.status} onChange={(e) => setOrderModal({ ...orderModal, status: e.target.value })}>
                <option>Preparing</option>
                <option>Ready</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </Field>

            <div className="items-header">
              <span>Product Name</span>
              <span>Qty</span>
              <span>Cost Price</span>
              <span>Subtotal</span>
            </div>
            {orderModal.items.map((it, i) => (
              <div key={i} className="item-row">
                <span>{it.name}</span>
                <span>{it.qty}</span>
                <span>{peso(it.cost)}</span>
                <span>{peso(it.qty * it.cost)}</span>
              </div>
            ))}

            <div className="totals">
              <Row label="Total Items:" value={totalItemsOf(orderModal)} />
              <Row label="Subtotal:" value={peso(subtotalOf(orderModal))} />
              <Row label="Delivery:" value={peso(orderModal.deliveryFee)} />
              <Row label="Total Amount:" value={peso(totalOf(orderModal))} bold />
            </div>

            <hr />

            {(() => {
              const cust = findCustomer(orderModal.customerId) || {};
              return (
                <>
                  <Field label="Customer ID"><input disabled value={orderModal.customerId} /></Field>
                  <Field label="Customer Name"><input disabled value={cust.name || ""} /></Field>
                  <Field label="Phone Number"><input disabled value={cust.phone || ""} /></Field>
                  <Field label="Address"><input disabled value={cust.address || ""} /></Field>
                </>
              );
            })()}

            <hr />

            <Field label="Payment ID"><input disabled value={orderModal.paymentId} /></Field>
            <Field label="Payment Method">
              <select value={orderModal.paymentMethod} onChange={(e) => setOrderModal({ ...orderModal, paymentMethod: e.target.value })}>
                <option>Cash on Delivery</option>
                <option>Cash</option>
                <option>GCash</option>
                <option>Card</option>
              </select>
            </Field>
            <Field label="Amount"><input disabled value={peso(totalOf(orderModal))} /></Field>
            <Field label="Payment Status">
              <select value={orderModal.paymentStatus} onChange={(e) => setOrderModal({ ...orderModal, paymentStatus: e.target.value })}>
                <option>Unpaid</option>
                <option>Paid</option>
                <option>Refunded</option>
              </select>
            </Field>

            {orderModal.type === "Delivery" && (
              <>
                <hr />
                <Field label="Delivery ID"><input disabled value={orderModal.deliveryId || ""} /></Field>
                <Field label="Delivery Rider">
                  <select value={orderModal.deliveryRider || ""} onChange={(e) => setOrderModal({ ...orderModal, deliveryRider: e.target.value })}>
                    <option value="">Unassigned</option>
                    <option>U-001</option>
                    <option>U-002</option>
                    <option>U-003</option>
                    <option>U-004</option>
                    <option>U-005</option>
                  </select>
                </Field>
                <Field label="Delivery Status">
                  <select value={orderModal.deliveryStatus || "Pending"} onChange={(e) => setOrderModal({ ...orderModal, deliveryStatus: e.target.value })}>
                    <option>Pending</option>
                    <option>Out for Delivery</option>
                    <option>Delivered</option>
                    <option>Failed</option>
                  </select>
                </Field>
              </>
            )}

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setOrderModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveOrder}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CUSTOMER MODAL ---------------- */}
      {customerModal && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setCustomerModal(null)}>
          <div className="modal modal-sm">
            <h3>{customerModal.isNew ? "Add Customer" : "Edit Customer"}</h3>

            <Field label="Customer ID">
              <input disabled value={customerModal.id} />
            </Field>
            <Field label="Customer Name">
              <input value={customerModal.name} onChange={(e) => setCustomerModal({ ...customerModal, name: e.target.value })} placeholder="Name" />
            </Field>
            <Field label="Phone Number">
              <input value={customerModal.phone} onChange={(e) => setCustomerModal({ ...customerModal, phone: e.target.value })} placeholder="Phone Number" />
            </Field>
            <Field label="Address">
              <textarea
                value={customerModal.address}
                onChange={(e) => setCustomerModal({ ...customerModal, address: e.target.value })}
                placeholder="Street, Brgy, City, Province, Zip Code"
              />
            </Field>

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setCustomerModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveCustomer}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CONFIRM DELETE MODAL ---------------- */}
      {confirmDelete && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className="modal modal-xs">
            <h3>Delete record?</h3>
            <p>This will permanently delete {confirmDelete.id}. This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => (confirmDelete.kind === "order" ? deleteOrder(confirmDelete.id) : deleteCustomer(confirmDelete.id))}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TOAST ---------------- */}
      {toastMsg && <div className="toast show">{toastMsg}</div>}
    </div>
  );
}