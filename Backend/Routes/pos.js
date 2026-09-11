import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function buildOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const tail = `${Date.now()}`.slice(-6);
  const random = `${Math.floor(Math.random() * 1000)}`.padStart(3, "0");
  return `ORD-${datePart}-${tail}${random}`;
}

// Same pattern as buildOrderNumber(), used for the two new record types
// this checkout now also creates.
function buildSaleNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const tail = `${Date.now()}`.slice(-6);
  const random = `${Math.floor(Math.random() * 1000)}`.padStart(3, "0");
  return `SL-${datePart}-${tail}${random}`;
}

function buildDeliveryNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const tail = `${Date.now()}`.slice(-6);
  const random = `${Math.floor(Math.random() * 1000)}`.padStart(3, "0");
  return `DR-${datePart}-${tail}${random}`;
}

const VAT_RATE = 0.12;

// ---------------------------------------------------------------------------
// POST /api/pos/checkout
// Processes point-of-sale orders and performs automatic stock deductions.
// Accessible by Employee & Web POS operators.
//
// Extends the original version with the three steps it was missing:
// creating the `sales` record (what actually shows up in Sales.jsx and the
// sales.js GET endpoints), the `payment` record, and — for Delivery orders —
// the `delivery` record (what PUT /api/v1/deliveries needs to exist before
// it can update anything).
//
// New optional body fields on top of the original: discount (peso amount,
// defaults to 0), amountCollected (for Cash — what the cashier actually
// received), deliveryAddress (required if orderType is 'Delivery'),
// deliveryCharge (defaults to 0). paymentMethod is now validated against
// the real payment_method CHECK constraint, since it feeds an actual
// payment row now instead of just being logged as inventory remarks text.
// ---------------------------------------------------------------------------
router.post("/checkout", requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      warehouseId,
      customerId,
      orderType,
      paymentMethod,
      remarks,
      items,
      discount = 0,
      amountCollected,
      deliveryAddress,
      deliveryCharge = 0,
    } = req.body;
    const userId = req.user?.user_id || req.user?.userId || req.user?.id;
    const companyId = req.user?.company_id || req.user?.companyId;

    if (!warehouseId || !customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Warehouse ID, customer ID, and item list are required." });
    }

    const finalOrderType = orderType || "Walk-in";
    if (!["Walk-in", "Pickup", "Delivery"].includes(finalOrderType)) {
      return res.status(400).json({ error: "orderType must be Walk-in, Pickup, or Delivery." });
    }

    if (!userId) {
      return res.status(401).json({ error: "Authenticated user ID is missing from token." });
    }

    // paymentMethod now feeds a real `payment` row with a CHECK constraint,
    // so it needs real validation (previously it was only logged as free
    // text and didn't need to match anything specific).
    const validPaymentMethods = ["Cash", "GCash", "Cheque", "Bank Transfer", "Credit"];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: `paymentMethod must be one of: ${validPaymentMethods.join(", ")}` });
    }
    if (finalOrderType === "Delivery" && !deliveryAddress) {
      return res.status(400).json({ error: "deliveryAddress is required for Delivery orders." });
    }

    await client.query("BEGIN");

    const warehouseRes = await client.query(
      `SELECT warehouse_id, company_id
       FROM warehouse
       WHERE warehouse_id = $1 AND status = 'Active'`,
      [warehouseId]
    );

    if (warehouseRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: `Warehouse ID ${warehouseId} is inactive or does not exist.` });
    }

    if (companyId && warehouseRes.rows[0].company_id !== Number(companyId)) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "You do not have access to this warehouse." });
    }

    const customerRes = await client.query(
      `SELECT customer_id
       FROM customer
       WHERE customer_id = $1 AND status = 'Active'`,
      [customerId]
    );

    if (customerRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: `Customer ID ${customerId} is inactive or does not exist.` });
    }

    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Invalid product or quantity in cart items." });
      }

      const productRes = await client.query(
        `SELECT unit_price FROM product WHERE product_id = $1 AND status = 'Active'`,
        [productId]
      );

      if (productRes.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: `Product ID ${productId} is inactive or does not exist.` });
      }

      const unitPrice = parseFloat(productRes.rows[0].unit_price);
      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;

      const invRes = await client.query(
        `SELECT inventory_id, stock_on_hand
         FROM inventory
         WHERE warehouse_id = $1 AND product_id = $2
         FOR UPDATE`,
        [warehouseId, productId]
      );

      if (invRes.rows.length === 0 || invRes.rows[0].stock_on_hand < quantity) {
        const available = invRes.rows.length > 0 ? invRes.rows[0].stock_on_hand : 0;
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Insufficient stock for Product ID ${productId}. Requested: ${quantity}, Available: ${available}`,
        });
      }

      verifiedItems.push({
        productId,
        quantity,
        unitPrice,
        subtotal,
        inventoryId: invRes.rows[0].inventory_id,
      });
    }

    const orderNo = buildOrderNumber();
    const orderRes = await client.query(
      `INSERT INTO orders (customer_id, order_no, order_type, order_status, total_amount, remarks)
       VALUES ($1, $2, $3, 'Completed', $4, $5)
       RETURNING order_id, order_no, order_date, total_amount, order_status`,
      [customerId, orderNo, finalOrderType, totalAmount, remarks || null]
    );

    const newOrder = orderRes.rows[0];

    for (const item of verifiedItems) {
      await client.query(
        `INSERT INTO order_details (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [newOrder.order_id, item.productId, item.quantity, item.unitPrice, item.subtotal]
      );

      await client.query(
        `UPDATE inventory
         SET stock_on_hand = stock_on_hand - $1,
             last_updated = CURRENT_TIMESTAMP
         WHERE inventory_id = $2`,
        [item.quantity, item.inventoryId]
      );

      await client.query(
        `INSERT INTO inventory_transaction (inventory_id, user_id, transaction_type, quantity, reason, reference_no, remarks)
         VALUES ($1, $2, 'Stock Out', $3, 'Sale', $4, $5)`,
        [item.inventoryId, userId, item.quantity, newOrder.order_no, paymentMethod || null]
      );
    }

    // ---- NEW: sales record — this is what makes the transaction show up
    // in Sales.jsx / GET /api/v1/sales. VAT and discount are computed here
    // since `orders.total_amount` (above) intentionally stays as the raw
    // goods subtotal, matching order_details' own subtotal figures.
    const vatableAmount = totalAmount - discount;
    const vat = Math.round(vatableAmount * VAT_RATE * 100) / 100;
    const finalTotal = Math.round((vatableAmount + vat) * 100) / 100;

    const saleNo = buildSaleNumber();
    const saleRes = await client.query(
      `INSERT INTO sales (order_id, customer_id, user_id, sale_no, sales_discount, total_amount, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING sale_id, sale_date`,
      [newOrder.order_id, customerId, userId, saleNo, discount, finalTotal, remarks || null]
    );
    const newSale = saleRes.rows[0];

    // ---- NEW: payment record
    const amountPaid = paymentMethod === "Cash" && amountCollected ? amountCollected : finalTotal;
    await client.query(
      `INSERT INTO payment (payment_type, sale_id, payment_method, amount_paid, remarks)
       VALUES ('Sale', $1, $2, $3, $4)`,
      [newSale.sale_id, paymentMethod, amountPaid, remarks || null]
    );

    // ---- NEW: delivery record, only for Delivery orders — this is what
    // PUT /api/v1/deliveries/:deliveryId then has something real to update.
    let delivery = null;
    if (finalOrderType === "Delivery") {
      const drNo = buildDeliveryNumber();
      const deliveryRes = await client.query(
        `INSERT INTO delivery (sale_id, dr_no, delivery_charge, delivery_address, delivery_status, remarks)
         VALUES ($1, $2, $3, $4, 'Pending', $5)
         RETURNING delivery_id`,
        [newSale.sale_id, drNo, deliveryCharge, deliveryAddress, remarks || null]
      );
      delivery = {
        deliveryId: deliveryRes.rows[0].delivery_id,
        drNo,
        status: "Pending",
        address: deliveryAddress,
      };
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Checkout successful and stock updated.",
      order: {
        orderId: newOrder.order_id,
        orderNo: newOrder.order_no,
        orderDate: newOrder.order_date,
        totalAmount: Number(newOrder.total_amount),
        status: newOrder.order_status,
        orderType: finalOrderType,
        itemCount: verifiedItems.length,
      },
      sale: {
        saleId: newSale.sale_id,
        saleNo,
        saleDate: newSale.sale_date,
        discount,
        vat,
        totalAmount: finalTotal,
      },
      payment: {
        method: paymentMethod,
        amountPaid,
        changeDue: paymentMethod === "Cash" ? Math.max((amountCollected || 0) - finalTotal, 0) : 0,
      },
      delivery,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/pos/checkout Error:", err);
    res.status(500).json({ error: "Checkout transaction failed: " + err.message });
  } finally {
    client.release();
  }
});

export default router;
