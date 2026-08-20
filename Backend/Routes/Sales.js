import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/sales
// Returns a list shaped to match Sales.jsx's `mockSales` array:
//   { id, datetime, cashier, cashierName, orderId, type, amount, status }
//
// Optional query params: ?search=SL-00&cashier=U-003&status=Completed
// ---------------------------------------------------------------------------

router.get("/", async (req, res) => {
  const { search, cashier, status } = req.query;

  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`s.sale_no ILIKE $${values.length}`);
  }
  if (cashier && cashier !== "All Cashier") {
    values.push(cashier);
    conditions.push(`u.user_id = $${values.length}`);
  }
  if (status && status !== "All Status") {
    values.push(status);
    conditions.push(`o.order_status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `
      SELECT
        s.sale_id,
        s.sale_no,
        s.sale_date,
        s.total_amount,
        s.sales_discount,
        u.user_id      AS cashier_id,
        u.first_name || ' ' || u.last_name AS cashier_name,
        o.order_id,
        o.order_no,
        o.order_type,
        o.order_status
      FROM sales s
      JOIN app_user u ON u.user_id = s.user_id
      LEFT JOIN orders o ON o.order_id = s.order_id
      ${whereClause}
      ORDER BY s.sale_date DESC
      `,
      values
    );

    const sales = result.rows.map((row) => ({
      id: row.sale_no,
      saleId: row.sale_id,
      datetime: row.sale_date,
      cashier: `U-${String(row.cashier_id).padStart(3, "0")}`,
      cashierName: row.cashier_name,
      orderId: row.order_no,
      type: row.order_type,
      amount: Number(row.total_amount),
      status: row.order_status,
    }));

    res.json(sales);
  } catch (err) {
    console.error("GET /api/sales failed:", err.message);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/sales/:saleId
// Returns full detail for the Sales Information modal, including line items
// pulled from order_details + product.
// ---------------------------------------------------------------------------

router.get("/:saleId", async (req, res) => {
  const { saleId } = req.params;

  try {
    const saleResult = await pool.query(
      `
      SELECT
        s.sale_id,
        s.sale_no,
        s.sale_date,
        s.total_amount,
        s.sales_discount,
        u.user_id AS cashier_id,
        u.first_name || ' ' || u.last_name AS cashier_name,
        o.order_id,
        o.order_no
      FROM sales s
      JOIN app_user u ON u.user_id = s.user_id
      LEFT JOIN orders o ON o.order_id = s.order_id
      WHERE s.sale_id = $1
      `,
      [saleId]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({ error: "Sale not found" });
    }

    const sale = saleResult.rows[0];

    const itemsResult = await pool.query(
      `
      SELECT
        p.product_name,
        od.quantity,
        od.unit_price,
        od.subtotal
      FROM order_details od
      JOIN product p ON p.product_id = od.product_id
      WHERE od.order_id = $1
      `,
      [sale.order_id]
    );

    res.json({
      id: sale.sale_no,
      datetime: sale.sale_date,
      cashierName: sale.cashier_name,
      orderId: sale.order_no,
      discount: Number(sale.sales_discount),
      items: itemsResult.rows.map((item) => ({
        name: item.product_name,
        qty: item.quantity,
        costPrice: Number(item.unit_price),
      })),
    });
  } catch (err) {
    console.error("GET /api/sales/:saleId failed:", err.message);
    res.status(500).json({ error: "Failed to fetch sale detail" });
  }
});

export default router;