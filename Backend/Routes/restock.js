import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

function buildPoNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const tail = `${Date.now()}`.slice(-6);
  const random = `${Math.floor(Math.random() * 1000)}`.padStart(3, "0");
  return `PO-${datePart}-${tail}${random}`;
}

// ---------------------------------------------------------------------------
// GET /api/v1/restock/recommendations
//
// Returns what needs restocking, per warehouse. Prefers REAL ML predictions
// from restock_recommendation (status = 'Pending', not yet acted on). Since
// no model is trained yet, that table is empty today — so this falls back
// to the same rule-based formula used in inventory.js's restock-suggestions,
// computed live and clearly labeled `source: "rule-based"`.
//
// The moment a real Python job starts writing rows into
// restock_recommendation, this endpoint automatically prefers those
// instead — no code change needed here when that day comes.
// ---------------------------------------------------------------------------

router.get("/recommendations", requireAuth, async (req, res) => {
  if (req.user.role === "Customer") {
    return res.status(403).json({ error: "Not available to customer accounts" });
  }

  try {
    const mlResult = await pool.query(
      `
      SELECT rr.restock_id, rr.product_id, rr.supplier_id, rr.warehouse_id,
             rr.predicted_demand, rr.recommended_quantity, rr.forecast_date,
             p.product_name, p.reorder_level, p.safety_stock,
             s.supplier_name, w.warehouse_name
      FROM restock_recommendation rr
      JOIN product p ON p.product_id = rr.product_id
      JOIN supplier s ON s.supplier_id = rr.supplier_id
      LEFT JOIN warehouse w ON w.warehouse_id = rr.warehouse_id
      WHERE rr.status = 'Pending'
        AND (rr.warehouse_id IS NULL OR w.company_id = $1)
      ORDER BY rr.forecast_date DESC
      `,
      [req.user.company_id]
    );

    if (mlResult.rows.length > 0) {
      const recommendations = mlResult.rows.map((row) => ({
        source: "ml-model",
        restockId: row.restock_id,
        productId: row.product_id,
        productName: row.product_name,
        supplierId: row.supplier_id,
        supplierName: row.supplier_name,
        warehouseId: row.warehouse_id,
        warehouseName: row.warehouse_name,
        predictedDemand: row.predicted_demand,
        recommendedQuantity: row.recommended_quantity,
        forecastDate: row.forecast_date,
      }));
      return res.json(recommendations);
    }

    // ---- Fallback: no ML predictions yet, compute the same formula live,
    // per warehouse this time (unlike inventory.js's version, which summed
    // across all warehouses company-wide).
    const fallbackResult = await pool.query(
      `
      SELECT p.product_id, p.product_name, p.reorder_level, p.safety_stock,
             p.supplier_id, s.supplier_name,
             w.warehouse_id, w.warehouse_name,
             COALESCE(i.stock_on_hand, 0) AS stock_on_hand
      FROM product p
      JOIN supplier s ON s.supplier_id = p.supplier_id
      JOIN warehouse w ON w.company_id = $1 AND w.status = 'Active'
      LEFT JOIN inventory i ON i.product_id = p.product_id AND i.warehouse_id = w.warehouse_id
      WHERE p.status = 'Active'
      `,
      [req.user.company_id]
    );

    const recommendations = fallbackResult.rows
      .map((row) => {
        const stock = row.stock_on_hand;
        const demandEstimate = row.reorder_level; // stand-in for PredictedDemand until XGBoost exists
        const recommendedQuantity = Math.max(demandEstimate + row.safety_stock - stock, 0);
        return {
          source: "rule-based",
          restockId: null, // no real recommendation row exists yet for this
          productId: row.product_id,
          productName: row.product_name,
          supplierId: row.supplier_id,
          supplierName: row.supplier_name,
          warehouseId: row.warehouse_id,
          warehouseName: row.warehouse_name,
          stockOnHand: stock,
          predictedDemand: demandEstimate,
          recommendedQuantity,
          forecastDate: null,
        };
      })
      .filter((r) => r.recommendedQuantity > 0);

    res.json(recommendations);
  } catch (err) {
    console.error("GET /api/v1/restock/recommendations failed:", err.message);
    res.status(500).json({ error: "Failed to fetch restock recommendations" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/restock/purchase-orders
//
// Creates a real purchase order from a recommendation (or from scratch, for
// a manual restocking decision not tied to any recommendation at all).
//
// Body: {
//   restockId,             // optional — omit for a manual/rule-based-driven PO
//   supplierId,             // required
//   expectedDeliveryDate,     // optional
//   items: [{ productId, quantity, unitCost }],
//   remarks
// }
//
// If restockId IS given and refers to a real restock_recommendation row,
// that row's status is updated to 'Converted' — matching the workflow your
// schema's restock_recommendation.status field implies (Pending -> ...
// Converted, once acted on).
// ---------------------------------------------------------------------------

router.post(
  "/purchase-orders",
  requireAuth,
  requireRole("Admin", "Manager", "Inventory Staff"),
  async (req, res) => {
    const { restockId, supplierId, expectedDeliveryDate, items, remarks } = req.body;

    if (!supplierId) {
      return res.status(400).json({ error: "supplierId is required" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items must be a non-empty array" });
    }
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0 || item.unitCost == null) {
        return res.status(400).json({
          error: "Each item needs a valid productId, quantity > 0, and unitCost",
        });
      }
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // If a real recommendation is referenced, confirm it actually exists
      // and hasn't already been converted/rejected before proceeding.
      if (restockId) {
        const recResult = await client.query(
          `SELECT restock_id, status FROM restock_recommendation WHERE restock_id = $1`,
          [restockId]
        );
        if (recResult.rows.length === 0) {
          throw { status: 404, message: `restock_recommendation ${restockId} not found` };
        }
        if (recResult.rows[0].status !== "Pending") {
          throw {
            status: 409,
            message: `restock_recommendation ${restockId} is already ${recResult.rows[0].status}`,
          };
        }
      }

      const totalAmount = items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0
      );

      const poNo = buildPoNumber();
      const poResult = await client.query(
        `INSERT INTO purchase_order
           (supplier_id, restock_id, created_by_user_id, po_no, order_date,
            expected_delivery_date, status, total_amount, remarks)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, 'Pending', $6, $7)
         RETURNING purchase_order_id, po_no, order_date`,
        [
          supplierId,
          restockId || null,
          req.user.user_id,
          poNo,
          expectedDeliveryDate || null,
          totalAmount,
          remarks || null,
        ]
      );
      const po = poResult.rows[0];

      for (const item of items) {
        const subtotal = Math.round(item.quantity * item.unitCost * 100) / 100;
        await client.query(
          `INSERT INTO purchase_order_item (purchase_order_id, product_id, quantity, unit_cost, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [po.purchase_order_id, item.productId, item.quantity, item.unitCost, subtotal]
        );
      }

      if (restockId) {
        await client.query(
          `UPDATE restock_recommendation SET status = 'Converted' WHERE restock_id = $1`,
          [restockId]
        );
      }

      await client.query("COMMIT");

      res.status(201).json({
        purchaseOrderId: po.purchase_order_id,
        poNo: po.po_no,
        orderDate: po.order_date,
        status: "Pending",
        totalAmount,
        restockId: restockId || null,
        items,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      console.error("POST /api/v1/restock/purchase-orders failed:", err.message);
      res.status(500).json({ error: "Failed to create purchase order" });
    } finally {
      client.release();
    }
  }
);

export default router;