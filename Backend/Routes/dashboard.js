import express from "express";
import {pool as db} from "../db.js";

const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    // 1. Total Sales Metrics (Today & Overall)
    const salesMetricsQuery = `
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COUNT(sale_id) AS total_orders,
        COALESCE(SUM(CASE WHEN sale_date::date = CURRENT_DATE THEN total_amount ELSE 0 END), 0) AS today_revenue,
        COUNT(CASE WHEN sale_date::date = CURRENT_DATE THEN sale_id END) AS today_orders
      FROM sales;
    `;

    // 2. Stock Alerts (Products where total stock_on_hand is at or below reorder_level)
    const stockAlertsQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        p.reorder_level,
        COALESCE(SUM(i.stock_on_hand), 0) AS current_stock
      FROM product p
      LEFT JOIN inventory i ON p.product_id = i.product_id
      WHERE p.status = 'Active'
      GROUP BY p.product_id, p.product_name, p.reorder_level
      HAVING COALESCE(SUM(i.stock_on_hand), 0) <= p.reorder_level;
    `;

    // 3. Top 5 Selling Products
    const topProductsQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        SUM(od.quantity)::INTEGER AS total_units_sold,
        SUM(od.subtotal) AS total_product_revenue
      FROM order_details od
      JOIN product p ON od.product_id = p.product_id
      GROUP BY p.product_id, p.product_name
      ORDER BY total_units_sold DESC
      LIMIT 5;
    `;

    // Execute queries concurrently
    const [salesResult, alertsResult, topProductsResult] = await Promise.all([
      db.query(salesMetricsQuery),
      db.query(stockAlertsQuery),
      db.query(topProductsQuery),
    ]);

    const metrics = salesResult.rows[0];
    const lowStockItems = alertsResult.rows;

    res.json({
      summary: {
        totalRevenue: parseFloat(metrics.total_revenue),
        totalOrders: parseInt(metrics.total_orders, 10),
        todayRevenue: parseFloat(metrics.today_revenue),
        todayOrders: parseInt(metrics.today_orders, 10),
        lowStockCount: lowStockItems.length,
      },
      lowStockAlerts: lowStockItems,
      topSellingProducts: topProductsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary data." });
  }
});

export default router;