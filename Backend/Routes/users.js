import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();
const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// GET /api/users
// Returns the list shaped for Users.jsx's table.
// Scoped to the logged-in user's company — no cross-company data leaks.
// Optional query params: ?search=juan&role=Admin&status=Active&branch=Pasig+Warehouse
// ---------------------------------------------------------------------------

router.get("/", requireAuth, async (req, res) => {
  const { search, role, status, branch } = req.query;
  const conditions = ["u.company_id = $1"];
  const values = [req.user.company_id];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(u.first_name || ' ' || u.last_name ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
  }
  if (role && role !== "All Roles") {
    values.push(role);
    conditions.push(`r.role_name = $${values.length}`);
  }
  if (status && status !== "All Status") {
    values.push(status);
    conditions.push(`u.status = $${values.length}`);
  }
  if (branch && branch !== "All Branch/Warehouse") {
    values.push(branch);
    conditions.push(`b.branch_name = $${values.length}`);
  }

  try {
    const result = await pool.query(
      `
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.status,
             r.role_name, b.branch_name
      FROM app_user u
      JOIN role r ON r.role_id = u.role_id
      LEFT JOIN branch b ON b.branch_id = u.branch_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY u.user_id
      `,
      values
    );

    const users = result.rows.map((row) => ({
      id: `U-${String(row.user_id).padStart(3, "0")}`,
      userId: row.user_id,
      name: `${row.first_name} ${row.last_name}`,
      email: row.email,
      role: row.role_name,
      branch: row.branch_name,
      status: row.status,
    }));

    res.json(users);
  } catch (err) {
    console.error("GET /api/users failed:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/users
// Creates a new user — this is the "Add User" modal's Save action.
// Restricted to Admins.
//
// Body: {
//   fullName, usernameEmail, password, role, branch, status
// }
// (fullName is split into first/last on the first space — see note below)
// ---------------------------------------------------------------------------

router.post("/", requireAuth, requireRole("Admin"), async (req, res) => {
  const { fullName, usernameEmail, password, role, branch, status } = req.body;

  if (!fullName || !usernameEmail || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // NOTE: your AddUserModal collects one "Full Name" field, but app_user
  // needs first_name and last_name separately. Splitting on the first
  // space is a reasonable default but breaks for single-word names or
  // names with multiple parts (e.g. "Maria Dela Cruz" -> last_name
  // becomes "Dela Cruz", which is usually right, but not guaranteed).
  // Consider splitting the form into two fields instead if this matters.
  const [firstName, ...rest] = fullName.trim().split(" ");
  const lastName = rest.join(" ") || firstName;

  try {
    const roleResult = await pool.query(`SELECT role_id FROM role WHERE role_name = $1`, [role]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ error: `Unknown role: ${role}` });
    }
    const roleId = roleResult.rows[0].role_id;

    let branchId = null;
    if (branch) {
      const branchResult = await pool.query(`SELECT branch_id FROM branch WHERE branch_name = $1`, [branch]);
      if (branchResult.rows.length === 0) {
        return res.status(400).json({ error: `Unknown branch: ${branch}` });
      }
      branchId = branchResult.rows[0].branch_id;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO app_user (company_id, role_id, branch_id, first_name, last_name, email, password_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING user_id, first_name, last_name, email, status`,
      [req.user.company_id, roleId, branchId, firstName, lastName, usernameEmail, passwordHash, status || "Active"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/users failed:", err.message);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/users/:userId
// Edits an existing user. Restricted to Admins.
// ---------------------------------------------------------------------------

router.put("/:userId", requireAuth, requireRole("Admin"), async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE app_user
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           status = COALESCE($4, status)
       WHERE user_id = $5 AND company_id = $6
       RETURNING user_id, first_name, last_name, email, status`,
      [firstName, lastName, email, status, userId, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/users/:userId failed:", err.message);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/users/:userId
// Restricted to Admins. Note: app_user is referenced by many other tables
// (sales, inventory_transaction, etc.) via foreign keys with no CASCADE,
// so deleting a user who has activity history will fail with a foreign-key
// violation. Prefer setting status = 'Inactive' instead of a hard delete
// once a user has any real activity — this endpoint is here for the "brand
// new, made a mistake" case.
// ---------------------------------------------------------------------------

router.delete("/:userId", requireAuth, requireRole("Admin"), async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM app_user WHERE user_id = $1 AND company_id = $2 RETURNING user_id`,
      [userId, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/users/:userId failed:", err.message);
    if (err.code === "23503") {
      return res.status(409).json({
        error: "Can't delete a user with existing activity — set status to Inactive instead",
      });
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;