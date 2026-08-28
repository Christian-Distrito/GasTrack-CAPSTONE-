-- =========================================================
-- SCHEMA PATCH: link users to a branch
-- Your original schema had no way to know which branch/warehouse
-- a user belongs to, but the "Add User" form needs it.
-- Run this once, after schema.sql, before the seed data below.
-- =========================================================

ALTER TABLE app_user
    ADD COLUMN branch_id INTEGER REFERENCES branch(branch_id);


-- =========================================================
-- SEED DATA
-- app_user requires an existing company, role, and (optionally) branch
-- before you can create any account. Run this once, after schema.sql
-- and the patch above.
-- =========================================================

-- Roles — must match the CHECK/role options your frontend dropdowns use
INSERT INTO role (role_name) VALUES
    ('Admin'),
    ('Manager'),
    ('Inventory Staff'),
    ('Driver'),
    ('Helper');

-- A starter company — adjust to your real business details,
-- or create one via the Register LPG Company API instead.
INSERT INTO company (company_name, dti_reg_no, doe_no, primary_branch, address)
VALUES ('GasTrack Demo Co.', 'DTI-0001', 'DOE-0001', 'Pasig Warehouse', '123 Ortigas Ave, Pasig City');

-- Starter branches for that company
INSERT INTO branch (company_id, branch_name, address, contact_no)
VALUES
    (1, 'Pasig Warehouse', '123 Ortigas Ave, Pasig City', '0900-000-0001'),
    (1, 'San Juan Warehouse', '45 N. Domingo St, San Juan City', '0900-000-0002');