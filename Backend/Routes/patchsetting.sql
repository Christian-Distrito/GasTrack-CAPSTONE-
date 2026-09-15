-- =========================================================
-- SCHEMA PATCH: Settings page support
-- Business Profile fields that didn't already exist go onto `company`
-- directly (Full name/Address already existed as company_name/address —
-- reused rather than duplicated). Everything else on the Settings page
-- (Financial & Tax Rules, Receipt and POS Output, System Behavior Rules)
-- goes into a new one-row-per-company `company_settings` table, since
-- none of it fit naturally as "company identity" data.
--
-- Run each statement individually in pgAdmin, per the lesson learned
-- earlier about batched scripts silently failing.
-- =========================================================

ALTER TABLE company
    ADD COLUMN contact_email VARCHAR(150);

ALTER TABLE company
    ADD COLUMN phone VARCHAR(30);

ALTER TABLE company
    ADD COLUMN logo_url VARCHAR(500);


CREATE TABLE company_settings (
    company_settings_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INTEGER NOT NULL UNIQUE,

    -- Financial & Tax Rules
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 12.00,
    tax_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    currency VARCHAR(10) NOT NULL DEFAULT 'PHP',
    rounding_rule VARCHAR(20) NOT NULL DEFAULT 'Round Up',

    -- Receipt and POS Output
    receipt_header_text VARCHAR(255),
    footer_message VARCHAR(255),
    show_logo_on_receipt BOOLEAN NOT NULL DEFAULT TRUE,
    show_tax_breakdown BOOLEAN NOT NULL DEFAULT TRUE,
    print_size VARCHAR(20) NOT NULL DEFAULT '80mm',

    -- System Behavior Rules
    auto_logout_minutes INTEGER NOT NULL DEFAULT 15,
    date_format VARCHAR(20) NOT NULL DEFAULT 'MM/DD/YYYY',
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    system_timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Manila',
    language VARCHAR(10) NOT NULL DEFAULT 'en',

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_settings_company
        FOREIGN KEY (company_id)
        REFERENCES company(company_id),

    CONSTRAINT chk_settings_tax_rate
        CHECK (tax_rate >= 0),

    CONSTRAINT chk_settings_rounding_rule
        CHECK (rounding_rule IN ('Round Up', 'Round Down', '2 Decimal Standard')),

    CONSTRAINT chk_settings_auto_logout
        CHECK (auto_logout_minutes > 0),

    CONSTRAINT chk_settings_theme
        CHECK (theme IN ('light', 'dark'))
);