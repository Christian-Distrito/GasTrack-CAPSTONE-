import express from "express";
import { pool as db } from "../db.js";

const router = express.Router();

// GET /api/v1/ar/models/:product_id
router.get("/models/:product_id", async (req, res) => {
  const { product_id } = req.params;

  if (isNaN(product_id)) {
    return res.status(400).json({ error: "Invalid product ID parameter." });
  }

  try {
    const query = `
      SELECT 
        product_id,
        product_name,
        unit_price,
        ar_model_url,
        status
      FROM product
      WHERE product_id = $1 AND status = 'Active';
    `;

    const { rows } = await db.query(query, [product_id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Product or AR model not found." });
    }

    const product = rows[0];

    if (!product.ar_model_url) {
      return res.status(404).json({ error: "3D model asset not configured for this product." });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:4000";

    return res.json({
      productId: product.product_id,
      productName: product.product_name,
      unitPrice: parseFloat(product.unit_price),
      arConfig: {
        placementType: "floor",
        formats: {
          glb: `${baseUrl}${product.ar_model_url}`,
          usdz: `${baseUrl}${product.ar_model_url.replace(".glb", ".usdz")}`
        }
      }
    });

  } catch (error) {
    console.error("Database query failed in AR route:", error.message);
    return res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
});

export default router;