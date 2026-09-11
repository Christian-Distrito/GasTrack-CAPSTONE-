import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Helper: resolve the logged-in Customer's customer_id from their user_id.
// Every route below is customer-facing (Web + Mobile Customer app), so
// every request needs this to know whose order it actually is.
// ---------------------------------------------------------------------------

async function getCustomerId(userId) {
  const result = await pool.query(
    `SELECT customer_id FROM customer WHERE user_id = $1`,
    [userId]
  );
  return result.rows.length ? result.rows[0].customer_id : null;
}

// ---------------------------------------------------------------------------
// POST /api/v1/orders
// A customer places a new order. Creates the order + its line items in one
// transaction, computing totals server-side from real product prices (never
// trust a price sent from the client).
//
// Body: {
//   orderType: 'Walk-in' | 'Pickup' | 'Delivery',
//   items: [{ productId, quantity }, ...],
//   remarks
// }
// ---------------------------------------------------------------------------

router.post("/", requireAuth, requireRole("Customer"), async (req, res) => {
  const { orderType, items, remarks } = req.body;

  if (!orderType || !["Walk-in", "Pickup", "Delivery"].includes(orderType)) {
    return res.status(400).json({ error: "orderType must be Walk-in, Pickup, or Delivery" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items must be a non-empty array" });
  }
  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ error: "Each item needs a valid productId and quantity > 0" });
    }
  }

  const customerId = await getCustomerId(req.user.user_id);
  if (!customerId) {
    return res.status(403).json({ error: "No customer profile found for this account" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Look up real, current prices — never trust prices from the client
    const productIds = items.map((i) => i.productId);
    const productResult = await client.query(
      `SELECT product_id, unit_price, status FROM product WHERE product_id = ANY($1::int[])`,
      [productIds]
    );
    const priceMap = new Map(productResult.rows.map((p) => [p.product_id, p]));

    for (const item of items) {
      const product = priceMap.get(item.productId);
      if (!product) {
        throw { status: 400, message: `Product ${item.productId} not found` };
      }
      if (product.status !== "Active") {
        throw { status: 400, message: `Product ${item.productId} is not currently available` };
      }
    }

    const lineItems = items.map((item) => {
      const unitPrice = Number(priceMap.get(item.productId).unit_price);
      const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
      return { ...item, unitPrice, subtotal };
    });
    const totalAmount = lineItems.reduce((sum, i) => sum + i.subtotal, 0);

    // Insert with a placeholder order_no, then fill in a readable one
    // derived from the real order_id once we have it.
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, order_no, order_type, order_status, total_amount, remarks)
       VALUES ($1, 'PENDING', $2, 'Pending', $3, $4)
       RETURNING order_id, order_date`,
      [customerId, orderType, totalAmount, remarks || null]
    );
    const orderId = orderResult.rows[0].order_id;
    const orderNo = `O-${String(orderId).padStart(5, "0")}`;

    await client.query(`UPDATE orders SET order_no = $1 WHERE order_id = $2`, [orderNo, orderId]);

    for (const item of lineItems) {
      await client.query(
        `INSERT INTO order_details (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.productId, item.quantity, item.unitPrice, item.subtotal]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      orderId,
      orderNo,
      orderDate: orderResult.rows[0].order_date,
      orderType,
      status: "Pending",
      totalAmount,
      items: lineItems,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("POST /api/v1/orders failed:", err.message);
    res.status(500).json({ error: "Failed to place order" });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/orders/my-orders
// Returns the logged-in customer's own order history, each with its line
// items. A customer can only ever see their own orders — customerId is
// derived from the authenticated token, never taken from the request.
// ---------------------------------------------------------------------------

router.get("/my-orders", requireAuth, requireRole("Customer"), async (req, res) => {
  const customerId = await getCustomerId(req.user.user_id);
  if (!customerId) {
    return res.status(403).json({ error: "No customer profile found for this account" });
  }

  try {
    const ordersResult = await pool.query(
      `SELECT order_id, order_no, order_date, order_type, order_status, total_amount, remarks
       FROM orders
       WHERE customer_id = $1
       ORDER BY order_date DESC`,
      [customerId]
    );

    const orderIds = ordersResult.rows.map((o) => o.order_id);
    let itemsByOrder = {};
    if (orderIds.length > 0) {
      const itemsResult = await pool.query(
        `SELECT od.order_id, p.product_name, od.quantity, od.unit_price, od.subtotal
         FROM order_details od
         JOIN product p ON p.product_id = od.product_id
         WHERE od.order_id = ANY($1::int[])`,
        [orderIds]
      );
      itemsByOrder = itemsResult.rows.reduce((acc, row) => {
        if (!acc[row.order_id]) acc[row.order_id] = [];
        acc[row.order_id].push({
          productName: row.product_name,
          quantity: row.quantity,
          unitPrice: Number(row.unit_price),
          subtotal: Number(row.subtotal),
        });
        return acc;
      }, {});
    }

    const orders = ordersResult.rows.map((o) => ({
      orderId: o.order_id,
      orderNo: o.order_no,
      orderDate: o.order_date,
      orderType: o.order_type,
      status: o.order_status,
      totalAmount: Number(o.total_amount),
      remarks: o.remarks,
      items: itemsByOrder[o.order_id] || [],
    }));

    res.json(orders);
  } catch (err) {
    console.error("GET /api/v1/orders/my-orders failed:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

export default router;