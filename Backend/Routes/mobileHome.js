import express from "express";
import { pool as db } from "../db.js";

const router = express.Router();

// GET /api/v1/mobile/home
router.get("/home", async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || "http://localhost:4000";

    // 1. Fetch Active Product Feed with Category & Brand Info
    const productQuery = `
      SELECT 
        p.product_id,
        p.product_name,
        c.category,
        b.brand,
        p.unit,
        p.unit_price,
        p.image_url,
        p.ar_model_url
      FROM product p
      JOIN category c ON p.category_id = c.category_id
      JOIN brand b ON p.brand_id = b.brand_id
      WHERE p.status = 'Active'
      ORDER BY p.product_name ASC;
    `;

    // 2. Fetch Active Categories for Filter Tabs
    const categoryQuery = `
      SELECT category_id, category 
      FROM category 
      ORDER BY category ASC;
    `;

    const [productResult, categoryResult] = await Promise.all([
      db.query(productQuery),
      db.query(categoryQuery)
    ]);

    // Format products for mobile client
    const products = productResult.rows.map(item => ({
      id: item.product_id,
      name: item.product_name,
      category: item.category,
      brand: item.brand,
      unit: item.unit,
      price: parseFloat(item.unit_price),
      imageUrl: item.image_url ? `${baseUrl}${item.image_url}` : null,
      hasArModel: Boolean(item.ar_model_url),
      arModelUrl: item.ar_model_url ? `${baseUrl}${item.ar_model_url}` : null
    }));

    // Format category list
    const categories = categoryResult.rows.map(cat => ({
      id: cat.category_id,
      name: cat.category
    }));

    return res.json({
      summary: {
        totalProducts: products.length,
        totalCategories: categories.length
      },
      categories,
      products
    });

  } catch (error) {
    console.error("Error fetching mobile home feed:", error.message);
    return res.status(500).json({
      error: "Failed to load home page feed.",
      details: error.message
    });
  }
});

export default router;