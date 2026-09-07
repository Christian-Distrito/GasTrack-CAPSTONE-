-- =========================================================
-- SCHEMA PATCH: link users to a branch
-- Safely adds branch_id to app_user if not already present.
-- =========================================================

ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS branch_id INTEGER REFERENCES branch(branch_id);


-- =========================================================
-- SEED DATA
-- Populate static lookup tables and initial demo entities.
-- =========================================================

-- 1. Roles
INSERT INTO role (role_name) VALUES
    ('Admin'),
    ('Manager'),
    ('Inventory Staff'),
    ('Driver'),
    ('Helper'),
    ('Customer')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Starter Company
INSERT INTO company (company_name, dti_reg_no, doe_no, primary_branch, address)
VALUES ('GasTrack Demo Co.', 'DTI-0001', 'DOE-0001', 'Pasig Warehouse', '123 Ortigas Ave, Pasig City')
ON CONFLICT (company_name) DO NOTHING;

-- 3. Starter Branches (Uses Subquery for Exact company_id)
INSERT INTO branch (company_id, branch_name, address, contact_no)
VALUES
    ((SELECT company_id FROM company WHERE company_name = 'GasTrack Demo Co.' LIMIT 1), 'Pasig Warehouse', '123 Ortigas Ave, Pasig City', '0900-000-0001'),
    ((SELECT company_id FROM company WHERE company_name = 'GasTrack Demo Co.' LIMIT 1), 'San Juan Warehouse', '45 N. Domingo St, San Juan City', '0900-000-0002');