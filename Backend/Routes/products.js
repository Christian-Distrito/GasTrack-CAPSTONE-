import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/products
// Returns products with category/brand/supplier names joined in, shaped
// close to what PosTerminal.jsx's mock `products` array looks like.
// Optional query params: ?search=gasul&category=Gasul&status=Active
// ---------------------------------------------------------------------------

router.get("/", requireAuth, async (req, res) => {
  const { search, category, status } = req.query;
  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`p.product_name ILIKE $${values.length}`);
  }
  if (category && category !== "All Categories") {
    values.push(category);
    conditions.push(`c.category = $${values.length}`);
  }
  if (status && status !== "All Status") {
    values.push(status);
    conditions.push(`p.status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `
      SELECT p.product_id, p.product_name, p.unit, p.unit_price, p.cost_price,
             p.reorder_level, p.image_url, p.status,
             c.category, b.brand, s.supplier_name
      FROM product p
      JOIN category c ON c.category_id = p.category_id
      JOIN brand b ON b.brand_id = p.brand_id
      JOIN supplier s ON s.supplier_id = p.supplier_id
      ${whereClause}
      ORDER BY p.product_id
      `,
      values
    );

    const products = result.rows.map((row) => ({
      id: `p${row.product_id}`,
      productId: row.product_id,
      name: row.product_name,
      category: row.category,
      brand: row.brand,
      supplier: row.supplier_name,
      unit: row.unit,
      price: Number(row.unit_price),
      costPrice: Number(row.cost_price),
      reorderLevel: row.reorder_level,
      image: row.image_url,
      status: row.status,
    }));

    res.json(products);
  } catch (err) {
    console.error("GET /api/products failed:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ---------------------------------------------------------------------------
// GET /api/products/categories
// GET /api/products/brands
// Simple lookups to populate the "Add Product" form's dropdowns.
// ---------------------------------------------------------------------------

router.get("/categories", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT category_id, category FROM category ORDER BY category`);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/products/categories failed:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

router.get("/brands", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`SELECT brand_id, brand FROM brand ORDER BY brand`);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/products/brands failed:", err.message);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/products
// Creates a new product. Restricted to Admins/Managers.
// Expects category_id, brand_id, supplier_id (not names) — the frontend's
// "Add Product" form should be populated from GET /api/categories,
// /api/brands, /api/suppliers dropdowns so it always sends valid IDs.
// ---------------------------------------------------------------------------

router.post("/", requireAuth, requireRole("Admin", "Manager"), async (req, res) => {
  const {
    productName,
    categoryId,
    brandId,
    supplierId,
    unit,
    unitPrice,
    costPrice,
    reorderLevel,
    imageUrl,
  } = req.body;

  if (!productName || !categoryId || !brandId || !supplierId || !unit || unitPrice == null || costPrice == null || reorderLevel == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO product (product_name, category_id, brand_id, supplier_id, unit, unit_price, cost_price, reorder_level, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING product_id, product_name`,
      [productName, categoryId, brandId, supplierId, unit, unitPrice, costPrice, reorderLevel, imageUrl || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/products failed:", err.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/products/:productId
// ---------------------------------------------------------------------------

router.put("/:productId", requireAuth, requireRole("Admin", "Manager"), async (req, res) => {
  const { productId } = req.params;
  const { productName, unitPrice, costPrice, reorderLevel, imageUrl, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE product
       SET product_name = COALESCE($1, product_name),
           unit_price = COALESCE($2, unit_price),
           cost_price = COALESCE($3, cost_price),
           reorder_level = COALESCE($4, reorder_level),
           image_url = COALESCE($5, image_url),
           status = COALESCE($6, status)
       WHERE product_id = $7
       RETURNING product_id, product_name, unit_price, cost_price, reorder_level, status`,
      [productName, unitPrice, costPrice, reorderLevel, imageUrl, status, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/products/:productId failed:", err.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/products/:productId
// Products are referenced by order_details, inventory, etc. — deleting a
// product with sales/inventory history will fail on the foreign key.
// Prefer setting status = 'Inactive' once a product has any real history.
// ---------------------------------------------------------------------------

router.delete("/:productId", requireAuth, requireRole("Admin"), async (req, res) => {
  const { productId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM product WHERE product_id = $1 RETURNING product_id`,
      [productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error("DELETE /api/products/:productId failed:", err.message);
    if (err.code === "23503") {
      return res.status(409).json({
        error: "Can't delete a product with existing sales/inventory history — set status to Inactive instead",
      });
    }
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;