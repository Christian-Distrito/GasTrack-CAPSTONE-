import React, { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  FileSearch,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AddUserModal from "./AddUserModal";
import "./Users.css";

// ---------------------------------------------------------------------------
// Mock data — replace with real API data
// ---------------------------------------------------------------------------

const mockUsers = [
  { id: "U-001", name: "Juan Dela Cruz", email: "juan.delacruz@abc.com", role: "Admin", branch: "Pasig Warehouse", status: "Active" },
  { id: "U-002", name: "Patrick Garcia", email: "patrick.garcia@abc.com", role: "Manager", branch: "San Juan Warehouse", status: "Active" },
  { id: "U-003", name: "Juana Tolentino", email: "juana.tolentino@abc.com", role: "Inventory Staff", branch: "San Juan Warehouse", status: "Inactive" },
  { id: "U-004", name: "Yvonne Cruz", email: "yvonne.cruz@abc.com", role: "Inventory Staff", branch: "Pasig Warehouse", status: "Active" },
  { id: "U-005", name: "Angela Gabriel", email: "angela.gabriel@abc.com", role: "Inventory Staff", branch: "Pasig Warehouse", status: "Active" },
  { id: "U-006", name: "Juan Dela Cruz", email: "juan.delacruz@abc.com", role: "Driver", branch: "Pasig Warehouse", status: "Active" },
  { id: "U-007", name: "Patrick Garcia", email: "patrick.garcia@abc.com", role: "Driver", branch: "San Juan Warehouse", status: "Active" },
  { id: "U-008", name: "Juana Tolentino", email: "juana.tolentino@abc.com", role: "Helper", branch: "San Juan Warehouse", status: "Inactive" },
  { id: "U-009", name: "Yvonne Cruz", email: "yvonne.cruz@abc.com", role: "Helper", branch: "Pasig Warehouse", status: "Active" },
  { id: "U-010", name: "Angela Gabriel", email: "angela.gabriel@abc.com", role: "Manager", branch: "Pasig Warehouse", status: "Active" },
];

const roles = ["All Roles", ...new Set(mockUsers.map((u) => u.role))];
const statuses = ["All Status", "Active", "Inactive"];
const branches = ["All Branch/Warehouse", ...new Set(mockUsers.map((u) => u.branch))];

const mockActivityLog = [
  { id: "U-001", name: "Juan Dela Cruz", role: "Admin", module: "Export", action: "Exported Sales", datetime: "01/01/2026 10:30:00 AM", status: "Active" },
  { id: "U-002", name: "Patrick Garcia", role: "Manager", module: "User", action: "Update Username", datetime: "01/01/2026 10:30:00 AM", status: "Active" },
  { id: "U-003", name: "Juana Tolentino", role: "Inventory Staff", module: "Inventory", action: "Add Stocks", datetime: "01/01/2026 10:30:00 AM", status: "Inactive" },
  { id: "U-004", name: "Yvonne Cruz", role: "Inventory Staff", module: "Inventory", action: "Deduct Stocks", datetime: "01/01/2026 10:30:00 AM", status: "Active" },
  { id: "U-005", name: "Angela Gabriel", role: "Inventory Staff", module: "Inventory", action: "Adjust Stocks", datetime: "01/01/2026 10:30:00 AM", status: "Active" },
  { id: "U-006", name: "Juan Dela Cruz", role: "Driver", module: "POS - Order", action: "Delivered", datetime: "01/01/2026 10:30:00 AM", status: "Active" },
  { id: "U-007", name: "Patrick Garcia", role: "Driver", module: "POS - Order", action: "Delivered", datetime: "01/01/2026 10:30:00 AM", status: "Active" },
  { id: "U-008", name: "Juana Tolentino", role: "Helper", module: "Inventory", action: "Deduct Stocks", datetime: "01/01/2026 10:30:00 AM", status: "Inactive" },
  { id: "U-009", name: "Yvonne Cruz", role: "Helper", module: "Inventory", action: "Adjust Stocks", datetime: "01/01/2026 10:30:00 AM", status: "Active" },
  { id: "U-010", name: "Angela Gabriel", role: "Manager", module: "Products", action: "Add Products", datetime: "01/01/2026 10:30:00 AM", status: "Active" },
];

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

function StatusPill({ status }) {
  const className = status === "Active" ? "status-pill active" : "status-pill inactive";
  return <span className={className}>{status}</span>;
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="filter-select-wrap">
      <select className="filter-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="filter-select-icon" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Users component
// ---------------------------------------------------------------------------

export default function Users() {
  const [users, setUsers] = useState(mockUsers);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [branchFilter, setBranchFilter] = useState("All Branch/Warehouse");
  const [page, setPage] = useState(1);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Activity Log tab state (kept separate from the Users tab filters)
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [activityRoleFilter, setActivityRoleFilter] = useState("All Roles");
  const [activityStatusFilter, setActivityStatusFilter] = useState("All Status");
  const [activityBranchFilter, setActivityBranchFilter] = useState("All Branch/Warehouse");
  const [activityPage, setActivityPage] = useState(1);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
      const matchesRole = roleFilter === "All Roles" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All Status" || u.status === statusFilter;
      const matchesBranch = branchFilter === "All Branch/Warehouse" || u.branch === branchFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesBranch;
    });
  }, [users, searchTerm, roleFilter, statusFilter, branchFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const filteredActivity = useMemo(() => {
    return mockActivityLog.filter((entry) => {
      const term = activitySearchTerm.toLowerCase();
      const matchesSearch = entry.name.toLowerCase().includes(term) || entry.id.toLowerCase().includes(term);
      const matchesRole = activityRoleFilter === "All Roles" || entry.role === activityRoleFilter;
      const matchesStatus = activityStatusFilter === "All Status" || entry.status === activityStatusFilter;
      // Branch isn't tracked on activity entries in this mock data, so this filter
      // is a no-op for now unless you add a `branch` field to each log entry.
      const matchesBranch = activityBranchFilter === "All Branch/Warehouse" || true;
      return matchesSearch && matchesRole && matchesStatus && matchesBranch;
    });
  }, [activitySearchTerm, activityRoleFilter, activityStatusFilter, activityBranchFilter]);

  const activityTotalPages = Math.max(1, Math.ceil(filteredActivity.length / PAGE_SIZE));
  const activityCurrentPage = Math.min(activityPage, activityTotalPages);
  const paginatedActivity = filteredActivity.slice(
    (activityCurrentPage - 1) * PAGE_SIZE,
    activityCurrentPage * PAGE_SIZE
  );

  const goToActivityPage = (p) => {
    if (p < 1 || p > activityTotalPages) return;
    setActivityPage(p);
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const handleSaveUser = (formData) => {
    const nextIdNumber = users.length + 1;
    const newUser = {
      id: `U-${String(nextIdNumber).padStart(3, "0")}`,
      name: formData.fullName,
      email: formData.usernameEmail,
      role: formData.role,
      branch: formData.branch,
      status: formData.status,
    };
    setUsers((prev) => [...prev, newUser]);
    setShowAddUserModal(false);
  };

  const handleView = (user) => console.log("View", user);
  const handleEdit = (user) => console.log("Edit", user);
  const handleDelete = (user) => console.log("Delete", user);

  return (
    <div className="users-page">
      <div className="users-inner">
        <h1 className="users-title">Users</h1>

        {/* Tabs */}
        <div className="users-tabs">
          <span
            className={`users-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </span>
          <span
            className={`users-tab ${activeTab === "activity" ? "active" : ""}`}
            onClick={() => setActiveTab("activity")}
          >
            Activity Log
          </span>
        </div>

        {activeTab === "users" ? (
          <>
            {/* Toolbar */}
            <div className="users-toolbar">
              <div className="users-search">
                <input
                  type="text"
                  placeholder="Search by Full Name, Username or Email"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="users-search-input"
                />
                <Search size={16} className="users-search-icon" />
              </div>

              <FilterSelect value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }} options={roles} />
              <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={statuses} />
              <FilterSelect value={branchFilter} onChange={(v) => { setBranchFilter(v); setPage(1); }} options={branches} />

              <button type="button" className="add-user-btn" onClick={handleAddUser}>
                <Plus size={16} />
                Add User
              </button>
            </div>

            {/* Table */}
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Username/Email</th>
                    <th>Role</th>
                    <th>Branch / Warehouse</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.branch}</td>
                      <td>
                        <StatusPill status={user.status} />
                      </td>
                      <td>
                        <div className="action-icons">
                          <button
                            type="button"
                            className="action-icon view"
                            aria-label={`View ${user.name}`}
                            onClick={() => handleView(user)}
                          >
                            <FileSearch size={16} />
                          </button>
                          <button
                            type="button"
                            className="action-icon edit"
                            aria-label={`Edit ${user.name}`}
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            className="action-icon delete"
                            aria-label={`Delete ${user.name}`}
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="no-results-cell">
                        No users match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="users-pagination">
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`page-btn ${p === currentPage ? "active" : ""}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Toolbar */}
            <div className="users-toolbar">
              <div className="users-search">
                <input
                  type="text"
                  placeholder="Search by Full Name, Username or Email"
                  value={activitySearchTerm}
                  onChange={(e) => {
                    setActivitySearchTerm(e.target.value);
                    setActivityPage(1);
                  }}
                  className="users-search-input"
                />
                <Search size={16} className="users-search-icon" />
              </div>

              <FilterSelect
                value={activityRoleFilter}
                onChange={(v) => { setActivityRoleFilter(v); setActivityPage(1); }}
                options={roles}
              />
              <FilterSelect
                value={activityStatusFilter}
                onChange={(v) => { setActivityStatusFilter(v); setActivityPage(1); }}
                options={statuses}
              />
              <FilterSelect
                value={activityBranchFilter}
                onChange={(v) => { setActivityBranchFilter(v); setActivityPage(1); }}
                options={branches}
              />
            </div>

            {/* Table */}
            <div className="users-table-wrap">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Module</th>
                    <th>Actions</th>
                    <th>Date and Time</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivity.map((entry, index) => (
                    <tr key={`${entry.id}-${index}`}>
                      <td>{entry.id}</td>
                      <td>{entry.name}</td>
                      <td>{entry.role}</td>
                      <td>{entry.module}</td>
                      <td>{entry.action}</td>
                      <td>{entry.datetime}</td>
                    </tr>
                  ))}
                  {paginatedActivity.length === 0 && (
                    <tr>
                      <td colSpan={6} className="no-results-cell">
                        No activity matches your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="users-pagination">
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => goToActivityPage(activityCurrentPage - 1)}
                  disabled={activityCurrentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: activityTotalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`page-btn ${p === activityCurrentPage ? "active" : ""}`}
                    onClick={() => goToActivityPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => goToActivityPage(activityCurrentPage + 1)}
                  disabled={activityCurrentPage === activityTotalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <AddUserModal
        isOpen={showAddUserModal}
        onCancel={() => setShowAddUserModal(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
}