-- =========================================================
-- SCHEMA PATCH: per-warehouse restock recommendations
-- restock_recommendation previously had no way to say WHICH warehouse a
-- prediction applies to — only product_id. Since inventory (and the
-- planned XGBoost feature set, which explicitly includes WarehouseID) is
-- tracked per warehouse, recommendations need to be too. A company with
-- multiple branches can have very different stock situations per location
-- for the same product.
--
-- Nullable for now, since a recommendation COULD theoretically be
-- company-wide — but the API built against this always sets it for any
-- new row going forward.
--
-- Run this once, after schema.sql and seed.sql.
-- =========================================================

ALTER TABLE restock_recommendation
    ADD COLUMN warehouse_id INTEGER REFERENCES warehouse(warehouse_id);