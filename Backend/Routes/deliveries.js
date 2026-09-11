import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// PUT /api/v1/deliveries/:deliveryId
// Updates an existing delivery's status, assigned driver, and/or delivery
// date. Restricted to staff (Admin/Manager/Driver) — a customer shouldn't
// be able to mark their own delivery "Delivered" or reassign a driver.
//
// NOTE ON A REAL DEPENDENCY: delivery rows are tied to sales (sale_id),
// not directly to orders — a delivery record only exists once an order
// has actually been checked out into a sale (see the `sales` table and
// `delivery.sale_id` foreign key in the schema). POS checkout, which is
// what would create both the sale AND its delivery record, hasn't been
// built yet (see routes/sales.js — it currently only has GET endpoints).
// This route works correctly against any delivery row that already
// exists, but there's nothing yet that CREATES one. That's the natural
// next piece to build once checkout exists.
//
// Body: { deliveryStatus, deliveredByUserId, deliveryDate, remarks }
//   deliveryStatus: 'Pending' | 'Out for Delivery' | 'Delivered' | 'Cancelled'
// ---------------------------------------------------------------------------

router.put(
  "/:deliveryId",
  requireAuth,
  requireRole("Admin", "Manager", "Driver"),
  async (req, res) => {
    const { deliveryId } = req.params;
    const { deliveryStatus, deliveredByUserId, deliveryDate, remarks } = req.body;

    if (
      deliveryStatus &&
      !["Pending", "Out for Delivery", "Delivered", "Cancelled"].includes(deliveryStatus)
    ) {
      return res.status(400).json({
        error: "deliveryStatus must be Pending, Out for Delivery, Delivered, or Cancelled",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE delivery
         SET delivery_status = COALESCE($1, delivery_status),
             delivered_by_user_id = COALESCE($2, delivered_by_user_id),
             delivery_date = COALESCE($3, delivery_date),
             remarks = COALESCE($4, remarks)
         WHERE delivery_id = $5
         RETURNING delivery_id, sale_id, dr_no, delivery_status, delivery_date,
                   delivered_by_user_id, delivery_address, remarks`,
        [deliveryStatus, deliveredByUserId, deliveryDate, remarks, deliveryId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Delivery not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("PUT /api/v1/deliveries/:deliveryId failed:", err.message);
      res.status(500).json({ error: "Failed to update delivery" });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/v1/deliveries — not in the spec you shared, but added since a
// driver/admin needs SOME way to find a delivery's ID before they can PUT
// to it. Lists deliveries, optionally filtered by status (e.g. a driver
// pulling up everything "Out for Delivery").
// ---------------------------------------------------------------------------

router.get("/", requireAuth, requireRole("Admin", "Manager", "Driver"), async (req, res) => {
  const { status } = req.query;
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`d.delivery_status = $${values.length}`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT d.delivery_id, d.sale_id, d.dr_no, d.delivery_status, d.delivery_date,
              d.delivery_address, d.delivery_charge, d.remarks,
              u.first_name || ' ' || u.last_name AS delivered_by_name
       FROM delivery d
       LEFT JOIN app_user u ON u.user_id = d.delivered_by_user_id
       ${whereClause}
       ORDER BY d.delivery_id DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/v1/deliveries failed:", err.message);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

export default router;