-- =========================================================
-- SCHEMA PATCH: safety stock per product
-- Safety Stock is a genuine buffer quantity, distinct from reorder_level
-- (a trigger threshold). See conversation notes: ReorderLevel already has
-- an implicit safety margin baked in when set thoughtfully — using it a
-- second time as a standalone buffer would double-count.
--
-- Defaults to 0 for existing products so this doesn't break any current
-- data. Go back and set real values per product once you know typical
-- demand variability (a common starting rule of thumb: safety_stock =
-- roughly half of what reorder_level currently represents, then tune
-- from there once real sales data exists).
--
-- Run this once, after schema.sql and seed.sql.
-- =========================================================

ALTER TABLE product
    ADD COLUMN safety_stock INTEGER NOT NULL DEFAULT 0;

ALTER TABLE product
    ADD CONSTRAINT chk_product_safety_stock CHECK (safety_stock >= 0);