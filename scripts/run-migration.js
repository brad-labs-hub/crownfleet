#!/usr/bin/env node
/**
 * Run database migrations against your Supabase project.
 *
 * 1. In Supabase Dashboard: Settings → Database → Connection string → URI
 * 2. Copy the connection string (includes your password)
 * 3. Run: DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres" node scripts/run-migration.js
 *
 * Or use the direct connection:
 *    DATABASE_URL="postgresql://postgres:[password]@db.ctrgdvksbljyytfyfodo.supabase.co:5432/postgres" node scripts/run-migration.js
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "Error: DATABASE_URL required.\n\n" +
      "Get it from Supabase Dashboard → Settings → Database → Connection string (URI)\n\n" +
      "Then run:\n" +
      '  DATABASE_URL="your-connection-string" node scripts/run-migration.js'
  );
  process.exit(1);
}

const sqlPath = path.join(__dirname, "../supabase/full-migration.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const client = new Client({ connectionString });

client
  .connect()
  .then(() => client.query(sql))
  .then(() => {
    console.log("✓ Migrations applied successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  })
  .finally(() => client.end());
