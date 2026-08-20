import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Single shared connection pool — every route file imports this
// instead of opening its own connection.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Quick sanity check on startup so a bad DATABASE_URL fails loudly
// instead of silently breaking the first query someone makes.
pool.query("SELECT NOW()")
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => {
    console.error("Failed to connect to PostgreSQL:", err.message);
  });