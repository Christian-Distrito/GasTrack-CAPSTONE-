import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/inventory
// Returns current stock per product per warehouse, matching the shape
// used by the Dashboard's "Restock Suggestion" panel and an Inventory page.
// Optional query params: ?warehouse=1&lowStockOnly=true
// ---------------------------------------------------------------------------

router.get("/", requireAuth, async (req, res) => {
  const { warehouse, lowStockOnly } = req.query;
  const conditions = ["w.company_id = $1"];
  const values = [req.user.company_id];

  if (warehouse) {
    values.push(warehouse);
    conditions.push(`i.warehouse_id = $${values.length}`);
  }

  try {
    const result = await pool.query(
      `
      SELECT i.inventory_id, i.stock_on_hand, i.last_updated,
             p.product_id, p.product_name, p.reorder_level,
             w.warehouse_id, w.warehouse_name
      FROM inventory i
      JOIN product p ON p.product_id = i.product_id
      JOIN warehouse w ON w.warehouse_id = i.warehouse_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.product_name
      `,
      values
    );

    let rows = result.rows.map((row) => ({
      inventoryId: row.inventory_id,
      productId: row.product_id,
      productName: row.product_name,
      warehouseId: row.warehouse_id,
      warehouseName: row.warehouse_name,
      stock: row.stock_on_hand,
      reorderLevel: row.reorder_level,
      isLowStock: row.stock_on_hand <= row.reorder_level,
      lastUpdated: row.last_updated,
    }));

    if (lowStockOnly === "true") {
      rows = rows.filter((r) => r.isLowStock);
    }

    res.json(rows);
  } catch (err) {
    console.error("GET /api/inventory failed:", err.message);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/inventory/restock-suggestions
// Rule-based restock logic — no ML yet, just stock_on_hand vs reorder_level.
// Matches the shape Dashboard.jsx's "Restock Suggestion" panel expects
// (name, stock, suggest, status: 'Critical' | 'Low Stock').
//
// THIS IS A DELIBERATE PLACEHOLDER. Once real sales history exists and an
// XGBoost model is trained (see ml/ folder), swap this query for one that
// reads from the `restock_recommendation` table instead — that table is
// exactly where the Python prediction script should write its output.
// The frontend/route contract (this JSON shape) doesn't need to change,
// only where the numbers come from.
//
// Thresholds used here:
//   stock <= reorder_level * 0.5  -> "Critical"
//   stock <= reorder_level        -> "Low Stock"
//   stock > reorder_level         -> not returned (no action needed)
// Suggested restock quantity = enough to reach 2x reorder_level.
// ---------------------------------------------------------------------------

router.get("/restock-suggestions", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT p.product_id, p.product_name, p.reorder_level,
             COALESCE(SUM(i.stock_on_hand), 0) AS total_stock
      FROM product p
      JOIN inventory i ON i.product_id = p.product_id
      JOIN warehouse w ON w.warehouse_id = i.warehouse_id
      WHERE w.company_id = $1 AND p.status = 'Active'
      GROUP BY p.product_id, p.product_name, p.reorder_level
      HAVING COALESCE(SUM(i.stock_on_hand), 0) <= p.reorder_level
      ORDER BY (COALESCE(SUM(i.stock_on_hand), 0)::float / NULLIF(p.reorder_level, 0)) ASC
      `,
      [req.user.company_id]
    );

    const suggestions = result.rows.map((row) => {
      const stock = Number(row.total_stock);
      const reorderLevel = row.reorder_level;
      const isCritical = stock <= reorderLevel * 0.5;

      return {
        productId: row.product_id,
        name: row.product_name,
        stock,
        suggest: Math.max(reorderLevel * 2 - stock, 0),
        status: isCritical ? "Critical" : "Low Stock",
      };
    });

    res.json(suggestions);
  } catch (err) {
    console.error("GET /api/v1/inventory/restock-suggestions failed:", err.message);
    res.status(500).json({ error: "Failed to compute restock suggestions" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/inventory/adjust
// Adjusts stock for a product at a warehouse AND writes an audit record to
// inventory_transaction — never update inventory.stock_on_hand directly,
// always go through this endpoint so there's a trail of who changed what.
//
// Body: { warehouseId, productId, transactionType, quantity, reason, remarks }
//   transactionType: 'Stock In' | 'Stock Out'
//   reason: 'Purchase' | 'Sale' | 'Damaged' | 'Lost' | 'Transfer' | 'Adjustment'
// ---------------------------------------------------------------------------

router.post("/adjust", requireAuth, requireRole("Admin", "Manager", "Inventory Staff"), async (req, res) => {
  const { warehouseId, productId, transactionType, quantity, reason, remarks } = req.body;

  if (!warehouseId || !productId || !transactionType || !quantity || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  if (!["Stock In", "Stock Out"].includes(transactionType)) {
    return res.status(400).json({ error: "transactionType must be 'Stock In' or 'Stock Out'" });
  }
  if (quantity <= 0) {
    return res.status(400).json({ error: "quantity must be greater than 0" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Find or create the inventory row for this warehouse/product pair
    let inventoryResult = await client.query(
      `SELECT inventory_id, stock_on_hand FROM inventory WHERE warehouse_id = $1 AND product_id = $2 FOR UPDATE`,
      [warehouseId, productId]
    );

    let inventoryId;
    let currentStock;

    if (inventoryResult.rows.length === 0) {
      const created = await client.query(
        `INSERT INTO inventory (warehouse_id, product_id, stock_on_hand) VALUES ($1, $2, 0) RETURNING inventory_id, stock_on_hand`,
        [warehouseId, productId]
      );
      inventoryId = created.rows[0].inventory_id;
      currentStock = created.rows[0].stock_on_hand;
    } else {
      inventoryId = inventoryResult.rows[0].inventory_id;
      currentStock = inventoryResult.rows[0].stock_on_hand;
    }

    const delta = transactionType === "Stock In" ? quantity : -quantity;
    const newStock = currentStock + delta;

    if (newStock < 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: `Not enough stock — only ${currentStock} on hand` });
    }

    await client.query(
      `UPDATE inventory SET stock_on_hand = $1, last_updated = CURRENT_TIMESTAMP WHERE inventory_id = $2`,
      [newStock, inventoryId]
    );

    const txResult = await client.query(
      `INSERT INTO inventory_transaction (inventory_id, user_id, transaction_type, quantity, reason, remarks)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING transaction_id, transaction_date`,
      [inventoryId, req.user.user_id, transactionType, quantity, reason, remarks || null]
    );

    await client.query("COMMIT");

    res.status(201).json({
      inventoryId,
      newStock,
      transaction: txResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/inventory/adjust failed:", err.message);
    res.status(500).json({ error: "Failed to adjust inventory" });
  } finally {
    client.release();
  }
});

export default router;