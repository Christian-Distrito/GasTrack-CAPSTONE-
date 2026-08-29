import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/companies/register
// Creates a new LPG Company profile & primary Admin User profile simultaneously.
// ---------------------------------------------------------------------------

router.post("/register", async (req, res) => {
  const {
    companyName,
    dtiRegNo,
    doeNo,
    primaryBranch,
    address,
    firstName,
    lastName,
    email,
    password,
  } = req.body;

  // 1. Input Validation
  if (
    !companyName ||
    !dtiRegNo ||
    !address ||
    !firstName ||
    !lastName ||
    !email ||
    !password
  ) {
    return res.status(400).json({
      error:
        "Missing required fields. Please provide companyName, dtiRegNo, address, firstName, lastName, email, and password.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 2. Check for duplicate company
    const existingCompany = await client.query(
      `SELECT company_id FROM company WHERE company_name = $1 OR dti_reg_no = $2`,
      [companyName, dtiRegNo]
    );

    if (existingCompany.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Company name or DTI registration number already registered." });
    }

    // 3. Check for duplicate admin email
    const existingUser = await client.query(
      `SELECT user_id FROM app_user WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Email address is already in use." });
    }

    // 4. Resolve 'Admin' role ID dynamically
    const roleResult = await client.query(
      `SELECT role_id FROM role WHERE LOWER(role_name) = 'admin' LIMIT 1`
    );

    if (roleResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(500).json({ error: "Admin role is not configured in database." });
    }

    const adminRoleId = roleResult.rows[0].role_id;

    // 5. Insert Company Record
    const companyResult = await client.query(
      `INSERT INTO company (company_name, dti_reg_no, doe_no, primary_branch, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING company_id, company_name, dti_reg_no, doe_no, primary_branch, address`,
      [companyName, dtiRegNo, doeNo || null, primaryBranch || null, address]
    );

    const newCompany = companyResult.rows[0];

    // 6. Hash Password & Insert Admin User Profile
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userResult = await client.query(
      `INSERT INTO app_user (company_id, role_id, first_name, last_name, email, password_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Active')
       RETURNING user_id, first_name, last_name, email, status, created_at`,
      [
        newCompany.company_id,
        adminRoleId,
        firstName,
        lastName,
        email,
        passwordHash,
      ]
    );

    const newAdmin = userResult.rows[0];

    await client.query("COMMIT");

    res.status(201).json({
      message: "Company & Admin profile registered successfully.",
      company: {
        companyId: newCompany.company_id,
        companyName: newCompany.company_name,
        dtiRegNo: newCompany.dti_reg_no,
        doeNo: newCompany.doe_no,
        primaryBranch: newCompany.primary_branch,
        address: newCompany.address,
      },
      admin: {
        userId: newAdmin.user_id,
        firstName: newAdmin.first_name,
        lastName: newAdmin.last_name,
        email: newAdmin.email,
        status: newAdmin.status,
        createdAt: newAdmin.created_at,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/companies/register failed:", err.message);
    res.status(500).json({ error: "Failed to register company and admin profile." });
  } finally {
    client.release();
  }
});

export default router;