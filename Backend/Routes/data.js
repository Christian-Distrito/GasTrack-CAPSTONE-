import express from "express";
import { pool as db } from "../db.js";

const router = express.Router();

// POST /api/v1/data/export
// Generates data export payloads and logs the operation
router.get("/export", async (req, res) => {
  // Using GET/POST interchangeably based on your spec, processing POST payload:
});

router.post("/export", async (req, res) => {
  const { userId, dataType, fileFormat, dateFrom, dateTo } = req.body;

  if (!userId || !dataType || !fileFormat) {
    return res.status(400).json({ 
      error: "Missing required fields: userId, dataType, and fileFormat are required." 
    });
  }

  try {
    let exportData = [];
    let fileName = `${dataType.toLowerCase()}_export_${Date.now()}.${fileFormat.toLowerCase()}`;

    // Fetch targeted dataset
    if (dataType.toLowerCase() === "sales") {
      const salesQuery = `
        SELECT s.sale_no, s.sale_date, s.total_amount, s.sales_discount, c.customer_type 
        FROM sales s
        LEFT JOIN customer c ON s.customer_id = c.customer_id
        ORDER BY s.sale_date DESC;
      `;
      const { rows } = await db.query(salesQuery);
      exportData = rows;
    } else if (dataType.toLowerCase() === "inventory") {
      const inventoryQuery = `
        SELECT p.product_name, p.unit, p.unit_price, p.reorder_level, i.stock_on_hand 
        FROM product p
        LEFT JOIN inventory i ON p.product_id = i.product_id;
      `;
      const { rows } = await db.query(inventoryQuery);
      exportData = rows;
    } else {
      return res.status(400).json({ error: "Invalid dataType. Supported types: 'Sales', 'Inventory'." });
    }

    // Log export activity in data_activity_log
    const logQuery = `
      INSERT INTO data_activity_log (
        user_id, activity_type, data_type, file_name, file_format, date_from, date_to, status
      ) VALUES ($1, 'Export', $2, $3, $4, $5, $6, 'Successful')
      RETURNING data_activity_id, activity_date;
    `;

    const logRes = await db.query(logQuery, [
      userId, 
      dataType, 
      fileName, 
      fileFormat.toUpperCase(), 
      dateFrom || null, 
      dateTo || null
    ]);

    return res.json({
      message: "Data export completed successfully.",
      exportDetails: {
        activityId: logRes.rows[0].data_activity_id,
        fileName,
        fileFormat: fileFormat.toUpperCase(),
        totalRecords: exportData.length,
        exportedAt: logRes.rows[0].activity_date
      },
      data: exportData
    });

  } catch (error) {
    console.error("Data export failed:", error.message);
    
    // Attempt logging failure if userId exists
    if (userId) {
      await db.query(`
        INSERT INTO data_activity_log (
          user_id, activity_type, data_type, file_name, file_format, status
        ) VALUES ($1, 'Export', $2, 'failed_export', $3, 'Failed');
      `, [userId, dataType || 'Unknown', fileFormat || 'RAW']).catch(() => {});
    }

    return res.status(500).json({ error: "Failed to process data export.", details: error.message });
  }
});

// POST /api/v1/data/import
// Receives JSON payload, inserts data, and logs the operation
router.post("/import", async (req, res) => {
  const { userId, dataType, fileName, fileFormat, records } = req.body;

  if (!userId || !dataType || !fileName || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ 
      error: "Invalid import payload. Ensure userId, dataType, fileName, and a non-empty records array are provided." 
    });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    let importedCount = 0;

    // Batch process records (Example: Batch Importing Categories/Products)
    if (dataType.toLowerCase() === "categories") {
      for (const item of records) {
        if (item.category) {
          await client.query(`
            INSERT INTO category (category) 
            VALUES ($1) 
            ON CONFLICT (category) DO NOTHING;
          `, [item.category]);
          importedCount++;
        }
      }
    } else {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Unsupported import dataType. Supported types: 'Categories'." });
    }

    // Log successful import
    const logQuery = `
      INSERT INTO data_activity_log (
        user_id, activity_type, data_type, file_name, file_format, status
      ) VALUES ($1, 'Import', $2, $3, $4, 'Successful')
      RETURNING data_activity_id, activity_date;
    `;

    const logRes = await client.query(logQuery, [
      userId, 
      dataType, 
      fileName, 
      (fileFormat || "JSON").toUpperCase()
    ]);

    await client.query("COMMIT");

    return res.json({
      message: "Data import completed successfully.",
      importDetails: {
        activityId: logRes.rows[0].data_activity_id,
        fileName,
        importedRecords: importedCount,
        importedAt: logRes.rows[0].activity_date
      }
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Data import failed:", error.message);

    return res.status(500).json({ error: "Failed to process data import.", details: error.message });
  } finally {
    client.release();
  }
});

export default router;