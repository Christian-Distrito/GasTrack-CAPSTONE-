import express from "express";
import { pool as db } from "../db.js";

const router = express.Router();

// GET /api/v1/reports/sales
// Returns aggregated revenue, sales counts, and breakdown by payment/order types
router.get("/sales", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = "";
    const params = [];

    if (startDate && endDate) {
      dateFilter = "WHERE s.sale_date BETWEEN $1 AND $2";
      params.push(startDate, endDate);
    }

    // 1. Overall Summary Metrics
    const summaryQuery = `
      SELECT 
        COUNT(s.sale_id)::INT AS total_transactions,
        COALESCE(SUM(s.total_amount), 0)::FLOAT AS gross_revenue,
        COALESCE(SUM(s.sales_discount), 0)::FLOAT AS total_discounts,
        COALESCE(SUM(s.total_amount - s.sales_discount), 0)::FLOAT AS net_revenue
      FROM sales s
      ${dateFilter};
    `;

    // 2. Sales Breakdown by Order Type
    const orderTypeQuery = `
      SELECT 
        o.order_type,
        COUNT(s.sale_id)::INT AS transaction_count,
        COALESCE(SUM(s.total_amount), 0)::FLOAT AS total_sales
      FROM sales s
      JOIN orders o ON s.order_id = o.order_id
      ${dateFilter}
      GROUP BY o.order_type;
    `;

    // 3. Payment Method Distribution
    const paymentQuery = `
      SELECT 
        p.payment_method,
        COUNT(p.payment_id)::INT AS payment_count,
        COALESCE(SUM(p.amount_paid), 0)::FLOAT AS total_paid
      FROM payment p
      JOIN sales s ON p.sale_id = s.sale_id
      ${dateFilter}
      GROUP BY p.payment_method;
    `;

    const [summaryRes, orderTypeRes, paymentRes] = await Promise.all([
      db.query(summaryQuery, params),
      db.query(orderTypeQuery, params),
      db.query(paymentQuery, params)
    ]);

    return res.json({
      period: {
        startDate: startDate || "All Time",
        endDate: endDate || "All Time"
      },
      summary: summaryRes.rows[0],
      salesByOrderType: orderTypeRes.rows,
      paymentDistribution: paymentRes.rows
    });

  } catch (error) {
    console.error("Error generating sales report:", error.message);
    return res.status(500).json({ error: "Failed to generate sales report.", details: error.message });
  }
});

// GET /api/v1/reports/compliance
// Tracks DOE/DTI permits, delivery compliance, and data audit logs
router.get("/compliance", async (req, res) => {
  try {
    // 1. Company Permits & Regulatory Registration Check
    const companyPermitQuery = `
      SELECT 
        company_name,
        dti_reg_no,
        doe_no,
        address
      FROM company
      LIMIT 1;
    `;

    // 2. Delivery & Logistics Compliance Metrics
    const deliveryComplianceQuery = `
      SELECT 
        delivery_status,
        COUNT(delivery_id)::INT AS count
      FROM delivery
      GROUP BY delivery_status;
    `;

    // 3. Recent Audit & Report Generation Logs
    const auditLogsQuery = `
      SELECT 
        data_activity_id,
        activity_type,
        data_type,
        file_name,
        status,
        activity_date
      FROM data_activity_log
      ORDER BY activity_date DESC
      LIMIT 10;
    `;

    const [companyRes, deliveryRes, auditRes] = await Promise.all([
      db.query(companyPermitQuery),
      db.query(deliveryComplianceQuery),
      db.query(auditLogsQuery)
    ]);

    const companyInfo = companyRes.rows[0] || {};

    return res.json({
      regulatoryDetails: {
        companyName: companyInfo.company_name || "N/A",
        dtiRegistrationNo: companyInfo.dti_reg_no || "N/A",
        doeLicenseNo: companyInfo.doe_no || "N/A",
        isDoeCompliant: Boolean(companyInfo.doe_no)
      },
      deliveryComplianceSummary: deliveryRes.rows,
      recentAuditLogs: auditRes.rows
    });

  } catch (error) {
    console.error("Error generating compliance report:", error.message);
    return res.status(500).json({ error: "Failed to generate compliance report.", details: error.message });
  }
});

export default router;