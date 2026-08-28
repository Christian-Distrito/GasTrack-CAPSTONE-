import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// POST /api/auth/login
// Body: { email, password }
// Returns: { token, user: { user_id, first_name, last_name, email, role, company_id } }
// ---------------------------------------------------------------------------

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      `
      SELECT u.user_id, u.first_name, u.last_name, u.email, u.password_hash,
             u.status, u.company_id, r.role_name
      FROM app_user u
      JOIN role r ON r.role_id = u.role_id
      WHERE u.email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      // Same error for "no such user" and "wrong password" —
      // don't reveal which one it was, that's a login-enumeration risk.
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    if (user.status !== "Active") {
      return res.status(403).json({ error: `Account is ${user.status.toLowerCase()}` });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        company_id: user.company_id,
        role: user.role_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role_name,
        company_id: user.company_id,
      },
    });
  } catch (err) {
    console.error("POST /api/auth/login failed:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/register-company
// Creates a new company AND its first Admin account together, in one
// transaction — matches the "Register LPG Company" button on the login page.
//
// Body: {
//   companyName, dtiRegNo, doeNo, primaryBranch, address,
//   adminFirstName, adminLastName, adminEmail, adminPassword
// }
// ---------------------------------------------------------------------------

router.post("/register-company", async (req, res) => {
  const {
    companyName,
    dtiRegNo,
    doeNo,
    primaryBranch,
    address,
    adminFirstName,
    adminLastName,
    adminEmail,
    adminPassword,
  } = req.body;

  if (!companyName || !dtiRegNo || !address || !adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const companyResult = await client.query(
      `INSERT INTO company (company_name, dti_reg_no, doe_no, primary_branch, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING company_id`,
      [companyName, dtiRegNo, doeNo || null, primaryBranch || null, address]
    );
    const companyId = companyResult.rows[0].company_id;

    const roleResult = await client.query(`SELECT role_id FROM role WHERE role_name = 'Admin'`);
    if (roleResult.rows.length === 0) {
      throw new Error("Admin role not found — run seed.sql first");
    }
    const adminRoleId = roleResult.rows[0].role_id;

    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    const userResult = await client.query(
      `INSERT INTO app_user (company_id, role_id, first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, first_name, last_name, email`,
      [companyId, adminRoleId, adminFirstName, adminLastName, adminEmail, passwordHash]
    );

    await client.query("COMMIT");

    res.status(201).json({
      company: { company_id: companyId, company_name: companyName },
      admin: userResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/auth/register-company failed:", err.message);

    if (err.code === "23505") {
      // unique_violation — duplicate DTI reg no, company name, or email
      return res.status(409).json({ error: "Company or email already registered" });
    }
    res.status(500).json({ error: "Registration failed" });
  } finally {
    client.release();
  }
});

export default router;