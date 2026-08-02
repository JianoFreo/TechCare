import { neon } from "@neondatabase/serverless";

import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const sql = neon(DATABASE_URL);

// -----------------------------------------------------------------------
// TABLE DEFINITIONS
// Each entry pairs a "CREATE TABLE IF NOT EXISTS" statement with the
// desired columns object used by syncSchema() below. Edit these when you
// add/remove a column, then call syncSchema() yourself when you want the
// change applied to the actual DB (see bottom of file for how to trigger).
// -----------------------------------------------------------------------
const TABLES: {
  table: string;
  createSQL: string;
  columns: Record<string, string>;
}[] = [
  {
    table: "users",
    createSQL: `CREATE TABLE IF NOT EXISTS users (
      id             SERIAL PRIMARY KEY,
      user_id        VARCHAR(255) UNIQUE NOT NULL,
      username       VARCHAR(255) NOT NULL UNIQUE,
      password       VARCHAR(255) NOT NULL,
      role           VARCHAR(50)  NOT NULL,
      full_name      VARCHAR(255) NOT NULL,
      email          VARCHAR(255) NOT NULL UNIQUE,
      contact_number VARCHAR(20)  NOT NULL,
      created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      user_id: "VARCHAR(255) UNIQUE NOT NULL",
      username: "VARCHAR(255) NOT NULL UNIQUE",
      password: "VARCHAR(255) NOT NULL",
      role: "VARCHAR(50) NOT NULL",
      full_name: "VARCHAR(255) NOT NULL",
      email: "VARCHAR(255) NOT NULL UNIQUE",
      contact_number: "VARCHAR(20) NOT NULL",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "patients",
    createSQL: `CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      patient_id        VARCHAR(255) UNIQUE NOT NULL,
      last_name         VARCHAR(100) NOT NULL,
      first_name        VARCHAR(100) NOT NULL,
      date_of_birth     DATE         NOT NULL,
      sex               VARCHAR(10)  NOT NULL,
      contact_number    VARCHAR(20),
      email             VARCHAR(255),
      address           TEXT,
      emergency_contact TEXT,
      image_url         TEXT,
      created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      patient_id: "VARCHAR(255) UNIQUE NOT NULL",
      last_name: "VARCHAR(100) NOT NULL",
      first_name: "VARCHAR(100) NOT NULL",
      date_of_birth: "DATE NOT NULL",
      sex: "VARCHAR(10) NOT NULL",
      contact_number: "VARCHAR(20)",
      email: "VARCHAR(255)",
      address: "TEXT",
      emergency_contact: "TEXT",
      image_url: "TEXT",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "services",
    createSQL: `CREATE TABLE IF NOT EXISTS services (
      id           SERIAL PRIMARY KEY,
      service_type VARCHAR(50)  NOT NULL,
      service_id   VARCHAR(255) UNIQUE NOT NULL,
      service_name VARCHAR(255) NOT NULL UNIQUE,
      price        DECIMAL(10,2) NOT NULL,
      active       BOOLEAN       NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      service_type: "VARCHAR(50) NOT NULL",
      service_id: "VARCHAR(255) UNIQUE NOT NULL",
      service_name: "VARCHAR(255) NOT NULL UNIQUE",
      price: "DECIMAL(10,2) NOT NULL",
      active: "BOOLEAN NOT NULL DEFAULT TRUE",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "queue_entries",
    createSQL: `CREATE TABLE IF NOT EXISTS queue_entries (
      id           SERIAL PRIMARY KEY,
      queue_id     VARCHAR(255) UNIQUE NOT NULL,
      patient_id   VARCHAR(255)     REFERENCES patients(patient_id),
      patient_name VARCHAR(255),
      queue_number INTEGER     NOT NULL,
      service_id   VARCHAR(255) NOT NULL REFERENCES services(service_id),
      service_name VARCHAR(255) NOT NULL,
      service_type VARCHAR(255) NOT NULL,
      is_priority  BOOLEAN     NOT NULL DEFAULT FALSE,
      status       VARCHAR(20) NOT NULL DEFAULT 'waiting',
      created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      queue_id: "VARCHAR(255) UNIQUE NOT NULL",
      patient_id: "VARCHAR(255) REFERENCES patients(patient_id)",
      patient_name: "VARCHAR(255)",
      queue_number: "INTEGER NOT NULL",
      service_id: "VARCHAR(255) NOT NULL REFERENCES services(service_id)",
      service_name: "VARCHAR(255) NOT NULL",
      service_type: "VARCHAR(255) NOT NULL",
      is_priority: "BOOLEAN NOT NULL DEFAULT FALSE",
      status: "VARCHAR(20) NOT NULL DEFAULT 'waiting'",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "consultations",
    createSQL: `CREATE TABLE IF NOT EXISTS consultations (
      id SERIAL PRIMARY KEY,
      consultation_id VARCHAR(255) UNIQUE NOT NULL,
      patient_id      VARCHAR(255)     NOT NULL REFERENCES patients(patient_id),
      doctor_id       VARCHAR(255)    NOT NULL REFERENCES users(user_id),
      queue_id        VARCHAR(255)     UNIQUE   REFERENCES queue_entries(queue_id),
      reason          VARCHAR(500),
      findings        JSONB,
      prescription    JSONB,
      status          VARCHAR(20) NOT NULL DEFAULT 'Open',
      consulted_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      consultation_id: "VARCHAR(255) UNIQUE NOT NULL",
      patient_id: "VARCHAR(255) NOT NULL REFERENCES patients(patient_id)",
      doctor_id: "VARCHAR(255) NOT NULL REFERENCES users(user_id)",
      queue_id: "VARCHAR(255) UNIQUE REFERENCES queue_entries(queue_id)",
      reason: "VARCHAR(500)",
      findings: "JSONB",
      prescription: "JSONB",
      status: "VARCHAR(20) NOT NULL DEFAULT 'Open'",
      consulted_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "lab_requests",
    createSQL: `CREATE TABLE IF NOT EXISTS lab_requests (
      id              SERIAL PRIMARY KEY,
      request_id      VARCHAR(255) UNIQUE NOT NULL,
      consultation_id VARCHAR(255) REFERENCES consultations(consultation_id),
      patient_id      VARCHAR(255)     NOT NULL REFERENCES patients(patient_id),
      doctor_id       VARCHAR(255) REFERENCES users(user_id),
      test_type       VARCHAR(200) NOT NULL,
      results         JSONB,
      status          VARCHAR(20)  NOT NULL DEFAULT 'Requested',
      is_paid         BOOLEAN      NOT NULL DEFAULT FALSE,
      requested_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      request_id: "VARCHAR(255) UNIQUE NOT NULL",
      consultation_id: "VARCHAR(255) REFERENCES consultations(consultation_id)",
      patient_id: "VARCHAR(255) NOT NULL REFERENCES patients(patient_id)",
      doctor_id: "VARCHAR(255) REFERENCES users(user_id)",
      test_type: "VARCHAR(200) NOT NULL",
      results: "JSONB",
      status: "VARCHAR(20) NOT NULL DEFAULT 'Requested'",
      is_paid: "BOOLEAN NOT NULL DEFAULT FALSE",
      requested_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "bills",
    createSQL: `CREATE TABLE IF NOT EXISTS bills (
        id                 SERIAL PRIMARY KEY,
        bill_id            VARCHAR(255) UNIQUE NOT NULL,
        patient_id         VARCHAR(255)     NOT NULL REFERENCES patients(patient_id),
        items              JSONB        NOT NULL,
        discount_pct       DECIMAL(5,2)  NOT NULL DEFAULT 0,
        total_amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_method     VARCHAR(30)   NOT NULL DEFAULT 'Cash',
        status             VARCHAR(20)   NOT NULL DEFAULT 'Unpaid',
        receipt_id         VARCHAR(50)   UNIQUE,
        created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        receipt_issued_at  TIMESTAMP,
        billed_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      bill_id: "VARCHAR(255) UNIQUE NOT NULL",
      patient_id: "VARCHAR(255) NOT NULL REFERENCES patients(patient_id)",
      items: "JSONB NOT NULL",
      discount_pct: "DECIMAL(5,2) NOT NULL DEFAULT 0",
      total_amount: "DECIMAL(10,2) NOT NULL DEFAULT 0",
      payment_method: "VARCHAR(30) NOT NULL DEFAULT 'Cash'",
      status: "VARCHAR(20) NOT NULL DEFAULT 'Unpaid'",
      receipt_id: "VARCHAR(50) UNIQUE",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      receipt_issued_at: "TIMESTAMP",
      billed_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "system_activity",
    createSQL: `CREATE TABLE IF NOT EXISTS system_activity (
      id  SERIAL PRIMARY KEY,
      activity_id  VARCHAR(255) UNIQUE NOT NULL,
      user_id      VARCHAR(255) NOT NULL REFERENCES users(user_id),
      service_name VARCHAR(255) NOT NULL REFERENCES services(service_name),
      details      JSONB        NOT NULL,
      created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      activity_id: "VARCHAR(255) UNIQUE NOT NULL",
      user_id: "VARCHAR(255) NOT NULL REFERENCES users(user_id)",
      service_name: "VARCHAR(255) NOT NULL REFERENCES services(service_name)",
      details: "JSONB NOT NULL",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
];

// -----------------------------------------------------------------------
// connectNeon: original behavior only. Just creates tables that don't
// exist yet. Does NOT add or drop any columns on tables that already
// exist. Safe to run on every server start.
// -----------------------------------------------------------------------
export async function connectNeon(): Promise<void> {
  try {
    for (const { createSQL } of TABLES) {
      await sql.query(createSQL);
    }
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing DB", error);
    process.exit(1);
  }
}

// -----------------------------------------------------------------------
// syncSchema: NOT called automatically anywhere. Call this yourself,
// on demand, whenever you want the DB's actual columns brought in line
// with the `columns` objects defined above (adds missing, drops extra).
//
// WARNING: dropping a column permanently deletes its data immediately.
// WARNING: adding a NOT NULL column to a table with existing rows needs
// a DEFAULT in its type string, or the ALTER will throw.
//
// Example ways to trigger it:
//   import { syncSchema } from "./config/db.js";
//   await syncSchema();                 // sync everything
//   await syncSchema(["users"]);        // sync just one table
// -----------------------------------------------------------------------
export async function syncSchema(onlyTables?: string[]): Promise<void> {
  const targets = onlyTables
    ? TABLES.filter((t) => onlyTables.includes(t.table))
    : TABLES;

  for (const { table, createSQL, columns } of targets) {
    await sql.query(createSQL);

    const actual = (await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${table}
    `) as { column_name: string }[];
    const actualNames = actual.map((r) => r.column_name);

    const missing = Object.keys(columns).filter(
      (c) => !actualNames.includes(c),
    );
    const extra = actualNames.filter((c) => !(c in columns));

    for (const col of missing) {
      console.log(`[schema-sync] ${table}: adding column "${col}"`);
      await sql.query(
        `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${columns[col]}`,
      );
    }
    for (const col of extra) {
      console.log(`[schema-sync] ${table}: dropping column "${col}"`);
      await sql.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS ${col}`);
    }

    if (missing.length === 0 && extra.length === 0) {
      console.log(`[schema-sync] ${table}: already in sync`);
    }
  }
}


// To change columns, do this:

// 1. **Edit two spots for the table you're changing**, inside the `TABLES` array:
//    - The `createSQL` string (so a *brand-new* DB gets it right from scratch)
//    - The `columns` object (so `syncSchema()` knows what to add/drop on an *existing* DB)

//    Example — adding an `avatar_url` column to `users`:
//    ```ts
//    createSQL: `CREATE TABLE IF NOT EXISTS users (
//      ...
//      avatar_url     TEXT,
//      ...
//    )`,
//    columns: {
//      ...
//      avatar_url: "TEXT",
//      ...
//    },
//    ```
//    To remove a column, just delete it from both places.

// 2. **Run `syncSchema()`** to apply it to the actual Neon DB. Since it's not auto-triggered, you need to call it yourself — e.g. a quick one-off:
//    ```bash
//    npx tsx -e "import('./src/config/db.js').then(m => m.syncSchema())"
//    ```
//    or `await syncSchema(["users"])` to only touch that one table.

// That's it — edit both spots, then call `syncSchema()`.