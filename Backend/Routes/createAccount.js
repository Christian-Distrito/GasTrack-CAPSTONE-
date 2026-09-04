import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/auth/customer/register
// Registers a new Customer account for the mobile app by creating both an
// app_user login record and a customer profile record in a single transaction.
// ---------------------------------------------------------------------------

router.post("/register", async (req, res) => {
  const {
    companyId,
    firstName,
    lastName,
    email,
    password,
    customerType, // 'Commercial' or 'Residential'
    contactNo,
    address,
  } = req.body;

  // 1. Input Validation
  if (
    !companyId ||
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !customerType ||
    !contactNo ||
    !address
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: companyId, firstName, lastName, email, password, customerType, contactNo, and address are required.",
    });
  }

  // Validate allowed customer types per Schema CHECK constraint
  if (!["Commercial", "Residential"].includes(customerType)) {
    return res.status(400).json({
      error: "customerType must be either 'Commercial' or 'Residential'.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 2. Check duplicate email in app_user
    const existingUser = await client.query(
      `SELECT user_id FROM app_user WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Email address is already in use." });
    }

    // 3. Resolve 'Customer' role ID dynamically
    const roleResult = await client.query(
      `SELECT role_id FROM role WHERE LOWER(role_name) = 'customer' LIMIT 1`
    );

    if (roleResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(500).json({ error: "Customer role is not configured in database." });
    }

    const customerRoleId = roleResult.rows[0].role_id;

    // 4. Hash password & insert into app_user table
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userResult = await client.query(
      `INSERT INTO app_user (company_id, role_id, first_name, last_name, email, password_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Active')
       RETURNING user_id, company_id, first_name, last_name, email, status, created_at`,
      [companyId, customerRoleId, firstName, lastName, email, passwordHash]
    );

    const newUser = userResult.rows[0];

    // 5. Insert into customer profile table linked to user_id
    const customerResult = await client.query(
      `INSERT INTO customer (user_id, customer_type, contact_no, address, status)
       VALUES ($1, $2, $3, $4, 'Active')
       RETURNING customer_id, customer_type, contact_no, address, status, created_at`,
      [newUser.user_id, customerType, contactNo, address]
    );

    const newCustomer = customerResult.rows[0];

    await client.query("COMMIT");

    res.status(201).json({
      message: "Customer account registered successfully.",
      user: {
        userId: newUser.user_id,
        companyId: newUser.company_id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        status: newUser.status,
      },
      customerProfile: {
        customerId: newCustomer.customer_id,
        customerType: newCustomer.customer_type,
        contactNo: newCustomer.contact_no,
        address: newCustomer.address,
        status: newCustomer.status,
        createdAt: newCustomer.created_at,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /api/auth/customer/register failed:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;