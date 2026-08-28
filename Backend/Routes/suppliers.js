import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/suppliers
// Optional query params: ?search=petron&status=Active
// ---------------------------------------------------------------------------

router.get("/", requireAuth, async (req, res) => {
  const { search, status } = req.query;
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`supplier_name ILIKE $${values.length}`);
  }
  if (status && status !== "All Status") {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT * FROM supplier ${whereClause} ORDER BY supplier_name`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/suppliers failed:", err.message);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/suppliers
// ---------------------------------------------------------------------------

router.post("/", requireAuth, requireRole("Admin", "Manager"), async (req, res) => {
  const { supplierName, contactPerson, email, address, contact, leadTimeDays } = req.body;

  if (!supplierName) {
    return res.status(400).json({ error: "supplierName is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO supplier (supplier_name, contact_person, email, address, contact, lead_time_days)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [supplierName, contactPerson || null, email || null, address || null, contact || null, leadTimeDays || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/suppliers failed:", err.message);
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/suppliers/:supplierId
// ---------------------------------------------------------------------------

router.put("/:supplierId", requireAuth, requireRole("Admin", "Manager"), async (req, res) => {
  const { supplierId } = req.params;
  const { supplierName, contactPerson, email, address, contact, leadTimeDays, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE supplier
       SET supplier_name = COALESCE($1, supplier_name),
           contact_person = COALESCE($2, contact_person),
           email = COALESCE($3, email),
           address = COALESCE($4, address),
           contact = COALESCE($5, contact),
           lead_time_days = COALESCE($6, lead_time_days),
           status = COALESCE($7, status)
       WHERE supplier_id = $8
       RETURNING *`,
      [supplierName, contactPerson, email, address, contact, leadTimeDays, status, supplierId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/suppliers/:supplierId failed:", err.message);
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/suppliers/:supplierId
// Suppliers are referenced by product and purchase_order — deleting one
// with existing products/orders will fail on the foreign key. Prefer
// setting status = 'Inactive' instead once a supplier has real history.
// ---------------------------------------------------------------------------

router.delete("/:supplierId", requireAuth, requireRole("Admin"), async (req, res) => {
  const { supplierId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM supplier WHERE supplier_id = $1 RETURNING supplier_id`,
      [supplierId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/suppliers/:supplierId failed:", err.message);
    if (err.code === "23503") {
      return res.status(409).json({
        error: "Can't delete a supplier with existing products/orders — set status to Inactive instead",
      });
    }
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});

export default router;