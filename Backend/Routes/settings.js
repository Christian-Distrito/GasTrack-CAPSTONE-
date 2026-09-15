import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// Helper: every company should have exactly one company_settings row.
// If one doesn't exist yet (e.g. an older company from before this patch
// ran), create it with defaults on first access instead of erroring.
// ---------------------------------------------------------------------------

async function ensureSettingsRow(companyId) {
  const existing = await pool.query(
    `SELECT company_settings_id FROM company_settings WHERE company_id = $1`,
    [companyId]
  );
  if (existing.rows.length === 0) {
    await pool.query(
      `INSERT INTO company_settings (company_id) VALUES ($1)`,
      [companyId]
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/settings
// Returns everything the Settings page needs in one call: Business Profile
// (from `company`) plus Financial & Tax / Receipt / System Behavior
// (from `company_settings`).
// ---------------------------------------------------------------------------

router.get("/", requireAuth, async (req, res) => {
  if (req.user.role === "Customer") {
    return res.status(403).json({ error: "Not available to customer accounts" });
  }

  try {
    await ensureSettingsRow(req.user.company_id);

    const result = await pool.query(
      `
      SELECT
        c.company_name, c.contact_email, c.phone, c.address, c.logo_url,
        cs.tax_rate, cs.tax_enabled, cs.currency, cs.rounding_rule,
        cs.receipt_header_text, cs.footer_message,
        cs.show_logo_on_receipt, cs.show_tax_breakdown, cs.print_size,
        cs.auto_logout_minutes, cs.date_format, cs.theme,
        cs.system_timezone, cs.language
      FROM company c
      JOIN company_settings cs ON cs.company_id = c.company_id
      WHERE c.company_id = $1
      `,
      [req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const row = result.rows[0];
    res.json({
      businessProfile: {
        fullName: row.company_name,
        contactEmail: row.contact_email,
        phone: row.phone,
        address: row.address,
        logoUrl: row.logo_url,
      },
      financialTaxRules: {
        taxRate: Number(row.tax_rate),
        taxEnabled: row.tax_enabled,
        currency: row.currency,
        roundingRule: row.rounding_rule,
      },
      receiptAndPosOutput: {
        receiptHeaderText: row.receipt_header_text,
        footerMessage: row.footer_message,
        showLogo: row.show_logo_on_receipt,
        showTaxBreakdown: row.show_tax_breakdown,
        printSize: row.print_size,
      },
      systemBehaviorRules: {
        autoLogoutMinutes: row.auto_logout_minutes,
        dateFormat: row.date_format,
        theme: row.theme,
        systemTimezone: row.system_timezone,
        language: row.language,
      },
    });
  } catch (err) {
    console.error("GET /api/v1/settings failed:", err.message);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/v1/settings
// Restricted to Admins — this is business-critical config (tax rate,
// receipt legal text, etc.), not something every staff member should edit.
//
// Supports PARTIAL updates, since your frontend has a separate Save button
// per section — each section can PUT just its own fields without needing
// to resend the entire form.
//
// Body (all fields optional):
// {
//   businessProfile: { fullName, contactEmail, phone, address, logoUrl },
//   financialTaxRules: { taxRate, taxEnabled, currency, roundingRule },
//   receiptAndPosOutput: { receiptHeaderText, footerMessage, showLogo, showTaxBreakdown, printSize },
//   systemBehaviorRules: { autoLogoutMinutes, dateFormat, theme, systemTimezone, language }
// }
// ---------------------------------------------------------------------------

router.put("/", requireAuth, requireRole("Admin"), async (req, res) => {
  const {
    businessProfile = {},
    financialTaxRules = {},
    receiptAndPosOutput = {},
    systemBehaviorRules = {},
  } = req.body;

  if (
    financialTaxRules.roundingRule &&
    !["Round Up", "Round Down", "2 Decimal Standard"].includes(financialTaxRules.roundingRule)
  ) {
    return res.status(400).json({
      error: "roundingRule must be 'Round Up', 'Round Down', or '2 Decimal Standard'",
    });
  }
  if (systemBehaviorRules.theme && !["light", "dark"].includes(systemBehaviorRules.theme)) {
    return res.status(400).json({ error: "theme must be 'light' or 'dark'" });
  }

  // Both taxRate and autoLogoutMinutes come from plain <input type="text">
  // fields on the frontend (not type="number"), so they could arrive as
  // non-numeric strings — validate explicitly instead of letting a bad
  // value crash into a confusing Postgres type error.
  let taxRateValue = null;
  if (financialTaxRules.taxRate !== undefined && financialTaxRules.taxRate !== null && financialTaxRules.taxRate !== "") {
    taxRateValue = Number(financialTaxRules.taxRate);
    if (Number.isNaN(taxRateValue) || taxRateValue < 0) {
      return res.status(400).json({ error: "taxRate must be a number >= 0" });
    }
  }

  let autoLogoutValue = null;
  if (
    systemBehaviorRules.autoLogoutMinutes !== undefined &&
    systemBehaviorRules.autoLogoutMinutes !== null &&
    systemBehaviorRules.autoLogoutMinutes !== ""
  ) {
    autoLogoutValue = parseInt(systemBehaviorRules.autoLogoutMinutes, 10);
    if (Number.isNaN(autoLogoutValue) || autoLogoutValue <= 0) {
      return res.status(400).json({ error: "autoLogoutMinutes must be a whole number > 0" });
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO company_settings (company_id) VALUES ($1) ON CONFLICT (company_id) DO NOTHING`,
      [req.user.company_id]
    );

    await client.query(
      `UPDATE company
       SET company_name = COALESCE($1, company_name),
           contact_email = COALESCE($2, contact_email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           logo_url = COALESCE($5, logo_url)
       WHERE company_id = $6`,
      [
        businessProfile.fullName,
        businessProfile.contactEmail,
        businessProfile.phone,
        businessProfile.address,
        businessProfile.logoUrl,
        req.user.company_id,
      ]
    );

    await client.query(
      `UPDATE company_settings
       SET tax_rate = COALESCE($1, tax_rate),
           tax_enabled = COALESCE($2, tax_enabled),
           currency = COALESCE($3, currency),
           rounding_rule = COALESCE($4, rounding_rule),
           receipt_header_text = COALESCE($5, receipt_header_text),
           footer_message = COALESCE($6, footer_message),
           show_logo_on_receipt = COALESCE($7, show_logo_on_receipt),
           show_tax_breakdown = COALESCE($8, show_tax_breakdown),
           print_size = COALESCE($9, print_size),
           auto_logout_minutes = COALESCE($10, auto_logout_minutes),
           date_format = COALESCE($11, date_format),
           theme = COALESCE($12, theme),
           system_timezone = COALESCE($13, system_timezone),
           language = COALESCE($14, language),
           updated_at = CURRENT_TIMESTAMP
       WHERE company_id = $15`,
      [
        taxRateValue,
        financialTaxRules.taxEnabled,
        financialTaxRules.currency,
        financialTaxRules.roundingRule,
        receiptAndPosOutput.receiptHeaderText,
        receiptAndPosOutput.footerMessage,
        receiptAndPosOutput.showLogo,
        receiptAndPosOutput.showTaxBreakdown,
        receiptAndPosOutput.printSize,
        autoLogoutValue,
        systemBehaviorRules.dateFormat,
        systemBehaviorRules.theme,
        systemBehaviorRules.systemTimezone,
        systemBehaviorRules.language,
        req.user.company_id,
      ]
    );

    await client.query("COMMIT");

    res.json({ message: "Settings updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /api/v1/settings failed:", err.message);
    res.status(500).json({ error: "Failed to update settings" });
  } finally {
    client.release();
  }
});

export default router;