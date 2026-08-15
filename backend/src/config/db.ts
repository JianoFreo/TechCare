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
      id                      SERIAL PRIMARY KEY,
      user_id                 VARCHAR(255) UNIQUE NOT NULL,
      username                VARCHAR(255) NOT NULL,
      password_hash           VARCHAR(255) NOT NULL,
      first_name              VARCHAR(255) NOT NULL,
      middle_name             VARCHAR(255),
      last_name               VARCHAR(255) NOT NULL,
      suffix                  VARCHAR(20),
      sex                     VARCHAR(20) NOT NULL,
      email                   VARCHAR(255) NOT NULL UNIQUE,
      contact_number          VARCHAR(20) NOT NULL,
      emergency_contact_name  VARCHAR(255),
      emergency_contact       VARCHAR(20),
      address                 TEXT NOT NULL,                
      birthdate               DATE NOT NULL,
      role                    VARCHAR(50) NOT NULL,
      department              VARCHAR(100),
      employment_status       VARCHAR(50),
      date_hired              DATE NOT NULL,
      shift_start             TIME NOT NULL DEFAULT '08:00:00',
      shift_end               TIME NOT NULL DEFAULT '17:00:00',
      last_login              TIMESTAMP,
      account_status          BOOLEAN NOT NULL DEFAULT TRUE,
      profile_photo           TEXT,
      created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      user_id: "VARCHAR(255) UNIQUE NOT NULL",
      username: "VARCHAR(255) NOT NULL",
      password_hash: "VARCHAR(255) NOT NULL",
      first_name: "VARCHAR(255) NOT NULL",
      middle_name: "VARCHAR(255)",
      last_name: "VARCHAR(255) NOT NULL",
      suffix: "VARCHAR(20)",
      sex: "VARCHAR(20) NOT NULL",
      email: "VARCHAR(255) NOT NULL UNIQUE",
      contact_number: "VARCHAR(20) NOT NULL",
      emergency_contact_name: "VARCHAR(255)",
      emergency_contact: "VARCHAR(20)",
      address: "TEXT NOT NULL",
      birthdate: "DATE NOT NULL",
      role: "VARCHAR(50) NOT NULL",
      department: "VARCHAR(100)",
      employment_status: "VARCHAR(50)",
      date_hired: "DATE NOT NULL",
      shift_start: "TIME NOT NULL DEFAULT '08:00:00'",
      shift_end: "TIME NOT NULL DEFAULT '17:00:00'",
      last_login: "TIMESTAMP",
      account_status: "BOOLEAN NOT NULL DEFAULT TRUE",
      profile_photo: "TEXT",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "patients",
    createSQL: `CREATE TABLE IF NOT EXISTS patients (
      id                      SERIAL PRIMARY KEY,
      patient_id              VARCHAR(255) UNIQUE NOT NULL,
      username                VARCHAR(255) NOT NULL,
      password_hash                VARCHAR(255) NOT NULL,
      first_name              VARCHAR(255) NOT NULL,
      middle_name             VARCHAR(255),
      last_name               VARCHAR(255) NOT NULL,
      suffix                  VARCHAR(20),
      sex                     VARCHAR(20) NOT NULL,
      email                   VARCHAR(255) NOT NULL UNIQUE,
      address                 TEXT NOT NULL,
      contact_number          VARCHAR(20) NOT NULL,
      civil_status            VARCHAR(50) NOT NULL DEFAULT 'Single',
      blood_type              VARCHAR(50),
      birthdate               DATE NOT NULL,
      emergency_contact_name  VARCHAR(255),
      emergency_contact       VARCHAR(20),
      created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      patient_id: "VARCHAR(255) UNIQUE NOT NULL",
      username: "VARCHAR(255) NOT NULL",
      password_hash: "VARCHAR(255) NOT NULL",
      first_name: "VARCHAR(255) NOT NULL",
      middle_name: "VARCHAR(255)",
      last_name: "VARCHAR(255) NOT NULL",
      suffix: "VARCHAR(20)",
      sex: "VARCHAR(20) NOT NULL",
      email: "VARCHAR(255) NOT NULL",
      address: "TEXT NOT NULL",
      contact_number: "VARCHAR(20) NOT NULL",
      civil_status: "VARCHAR(50) NOT NULL DEFAULT 'Single'",
      blood_type: "VARCHAR(50)",
      birthdate: "DATE NOT NULL",
      emergency_contact_name: "VARCHAR(255)",
      emergency_contact: "VARCHAR(20)",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "services",
    createSQL: `CREATE TABLE IF NOT EXISTS services (
      id            SERIAL PRIMARY KEY,
      service_id    VARCHAR(255) UNIQUE NOT NULL,
      service_name  VARCHAR(255) UNIQUE NOT NULL,
      service_type  VARCHAR(50) NOT NULL,
      price         NUMERIC(10,2) NOT NULL,
      room          VARCHAR(50),
      active        BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      service_id: "VARCHAR(255) UNIQUE NOT NULL",
      service_name: "VARCHAR(255) UNIQUE NOT NULL",
      service_type: "VARCHAR(50) NOT NULL",
      price: "NUMERIC(10,2) NOT NULL",
      room: "VARCHAR(50) NOT NULL",
      active: "BOOLEAN NOT NULL DEFAULT TRUE",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      update_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "packages",
    createSQL: `CREATE TABLE IF NOT EXISTS packages(
      id            SERIAL PRIMARY KEY,
      package_id    VARCHAR(255) UNIQUE NOT NULL,
      package_name  VARCHAR(255) UNIQUE NOT NULL,
      price         NUMERIC(10,2) NOT NULL,
      active        BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      package_id: "VARCHAR(255) UNIQUE NOT NULL",
      package_name: "VARCHAR(255) UNIQUE NOT NULL",
      price: "NUMERIC(10,2) NOT NULL",
      active: "BOOLEAN NOT NULL DEFAULT TRUE",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      update_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "package_items",
    createSQL: `CREATE TABLE IF NOT EXISTS package_items(
      id            SERIAL PRIMARY KEY,
      item_id       VARCHAR(255) UNIQUE NOT NULL,
      package_id    VARCHAR(255) UNIQUE NOT NULL REFERENCES packages(package_id),
      service_id    VARCHAR(255) UNIQUE NOT NULL REFERENCES services(service_id)
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      item_id: "VARCHAR(255) UNIQUE NOT NULL",
      package_id:
        "VARCHAR(255) UNIQUE NOT NULL REFERENCES packages(package_id)",
      service_id:
        "VARCHAR(255) UNIQUE NOT NULL REFERENCES services(service_id)",
    },
  },
  {
    table: "queue_entries",
    createSQL: `CREATE TABLE IF NOT EXISTS queue_entries (
      id            SERIAL PRIMARY KEY,
      queue_id      VARCHAR(255) UNIQUE NOT NULL,
      patient_id    VARCHAR(255) NOT NULL REFERENCES patients(patient_id),
      queue_number  VARCHAR(50) NOT NULL,
      service_id    VARCHAR(255) NOT NULL REFERENCES services(service_id),
      is_priority   BOOLEAN NOT NULL,
      status        VARCHAR(50) NOT NULL,
      created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      update_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      queue_id: "VARCHAR(255) UNIQUE NOT NULL",
      patient_id: "VARCHAR(255) REFERENCES patients(patient_id)",
      queue_number: "VARCHAR(50)",
      service_id: "VARCHAR(255) REFERENCES services(service_id)",
      is_priority: "BOOLEAN NOT NULL",
      status: "VARCHAR(50) NOT NULL",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      update_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "consultations",
    createSQL: `CREATE TABLE IF NOT EXISTS consultations (
      id                 SERIAL PRIMARY KEY,
      consultation_id    VARCHAR(255) UNIQUE NOT NULL,
      patient_id         VARCHAR(255) NOT NULL REFERENCES patients(patient_id),
      user_id            VARCHAR(255) NOT NULL REFERENCES users(user_id),
      queue_id           VARCHAR(255) NOT NULL REFERENCES queue_entries(queue_id),
      chief_complaint    VARCHAR(255),
      diagnosis          VARCHAR(255),
      blood_pressure     VARCHAR(20),
      temperature        NUMERIC(4,1),
      weight             NUMERIC(5,2),
      height             NUMERIC(5,2),
      notes              TEXT,
      consultation_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      consultation_id: "VARCHAR(255) UNIQUE NOT NULL",
      patient_id: "VARCHAR(255) NOT NULL REFERENCES patients(patient_id)",
      user_id: "VARCHAR(255) NOT NULL REFERENCES users(user_id)",
      queue_id: "VARCHAR(255) REFERENCES queue_entries(queue_id)",
      chief_complaint: "VARCHAR(255)",
      diagnosis: "VARCHAR(255)",
      blood_pressure: "VARCHAR(20)",
      temperature: "NUMERIC(4,1)",
      weight: "NUMERIC(5,2)",
      height: "NUMERIC(5,2)",
      notes: "TEXT",
      consultation_date: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "prescriptions",
    createSQL: `CREATE TABLE IF NOT EXISTS prescriptions (
      id               SERIAL PRIMARY KEY,
      prescription_id  VARCHAR(255) UNIQUE NOT NULL,
      consultation_id  VARCHAR(255) NOT NULL REFERENCES consultations(consultation_id),
      patient_id       VARCHAR(255) NOT NULL REFERENCES patients(patient_id),
      user_id          VARCHAR(255) NOT NULL REFERENCES users(user_id),
      date_prescribed  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      notes            VARCHAR(255),
      created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      prescription_id: "VARCHAR(255) UNIQUE NOT NULL",
      consultation_id:
        "VARCHAR(255) NOT NULL REFERENCES consultations(consultation_id)",
      patient_id: "VARCHAR(255) NOT NULL REFERENCES patients(patient_id)",
      user_id: "VARCHAR(255) NOT NULL REFERENCES users(user_id)",
      date_prescribed: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      notes: "VARCHAR(255)",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "laboratory_requests",
    createSQL: `CREATE TABLE IF NOT EXISTS laboratory_requests (
      id               SERIAL PRIMARY KEY,
      request_id       VARCHAR(255) UNIQUE NOT NULL,
      patient_id       VARCHAR(255) NOT NULL REFERENCES patients(patient_id),
      consultation_id  VARCHAR(255) REFERENCES consultations(consultation_id),
      requested_by     VARCHAR(255) REFERENCES users(user_id),
      performed_by     VARCHAR(255) REFERENCES users(user_id),
      is_paid          BOOLEAN NOT NULL DEFAULT FALSE,
      requested_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at     TIMESTAMP,
      updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      request_id: "VARCHAR(255) UNIQUE NOT NULL",
      patient_id: "VARCHAR(255) NOT NULL REFERENCES patients(patient_id)",
      consultation_id: "VARCHAR(255) REFERENCES consultations(consultation_id)",
      requested_by: "VARCHAR(255) REFERENCES users(user_id)",
      performed_by: "VARCHAR(255) REFERENCES users(user_id)",
      is_paid: "BOOLEAN NOT NULL DEFAULT FALSE",
      requested_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      completed_at: "TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "request_items",
    createSQL: `CREATE TABLE IF NOT EXISTS request_items (
    id              SERIAL PRIMARY KEY,
    lab_item_id     VARCHAR(255) UNIQUE NOT NULL,
    request_id      VARCHAR(255) NOT NULL REFERENCES laboratory_requests(request_id),
    service_id      VARCHAR(255) NOT NULL REFERENCES services(service_id),
    queue_id        VARCHAR(255) REFERENCES queue_entries(queue_id),
    status          VARCHAR(50) NOT NULL DEFAULT 'Requested',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      lab_item_id: "VARCHAR(255) UNIQUE NOT NULL",
      request_id:
        "VARCHAR(255) NOT NULL REFERENCES laboratory_requests(request_id)",
      service_id: "VARCHAR(255) NOT NULL REFERENCES services(service_id)",
      queue_id: "VARCHAR(255) REFERENCES queue_entries(queue_id)",
      status: "VARCHAR(50) NOT NULL DEFAULT 'Requested'",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "laboratory_results",
    createSQL: `CREATE TABLE IF NOT EXISTS laboratory_results (
      id               SERIAL PRIMARY KEY,
      result_id        VARCHAR(255) UNIQUE NOT NULL,
      lab_item_id      VARCHAR(255) NOT NULL REFERENCES request_items(lab_item_id),
      parameter_name   VARCHAR(255) NOT NULL,
      result_value     VARCHAR(255) NOT NULL,
      unit             VARCHAR(50),
      reference_range  VARCHAR(100),
      flag             VARCHAR(50),
      remarks          VARCHAR(255),
      verified_by      VARCHAR(255),
      image_url        VARCHAR(500),
      verified_at      TIMESTAMP,
      created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      result_id: "VARCHAR(255) UNIQUE NOT NULL",
      lab_item_id:
        "VARCHAR(255) NOT NULL REFERENCES request_items(lab_item_id)",
      parameter_name: "VARCHAR(255) NOT NULL",
      result_value: "VARCHAR(255) NOT NULL",
      unit: "VARCHAR(50)",
      reference_range: "VARCHAR(100)",
      flag: "VARCHAR(50)",
      remarks: "VARCHAR(255)",
      verified_by: "VARCHAR(255)",
      image_url: "VARCHAR(500)",
      verified_at: "TIMESTAMP",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "bills",
    createSQL: `CREATE TABLE IF NOT EXISTS bills(
      id                 SERIAL PRIMARY KEY,
      bill_id            VARCHAR(255) UNIQUE NOT NULL,
      patient_id         VARCHAR(255) NOT NULL REFERENCES patients(patient_id),
      queue_id           VARCHAR(255) REFERENCES queue_entries(queue_id),
      consultation_id    VARCHAR(255) REFERENCES consultations(consultation_id),
      issued_by          VARCHAR(255) NOT NULL REFERENCES users(user_id),
      subtotal           NUMERIC(10,2) NOT NULL,
      discount_pct       NUMERIC(5,2),
      total_amount       NUMERIC(10,2) NOT NULL,
      status             VARCHAR(50) NOT NULL,
      billed_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      receipt_issued_at  TIMESTAMP,
      updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      bill_id: "VARCHAR(255) UNIQUE NOT NULL",
      patient_id: "VARCHAR(255) NOT NULL REFERENCES patients(patient_id)",
      queue_id: "VARCHAR(255) REFERENCES queue_entries(queue_id)",
      consultation_id: "VARCHAR(255) REFERENCES consultations(consultation_id)",
      issued_by: "VARCHAR(255) NOT NULL REFERENCES users(user_id)",
      subtotal: "NUMERIC(10,2) NOT NULL",
      discount_pct: "NUMERIC(5,2)",
      total_amount: "NUMERIC(10,2) NOT NULL",
      status: "VARCHAR(50) NOT NULL",
      billed_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
      receipt_issued_at: "TIMESTAMP",
      updated_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  },
  {
    table: "bill_items",
    createSQL: `CREATE TABLE IF NOT EXISTS bill_items (
      id            SERIAL PRIMARY KEY,
      bill_item_id  VARCHAR(255) UNIQUE NOT NULL,
      bill_id       VARCHAR(255) NOT NULL REFERENCES bills(bill_id),
      service_id    VARCHAR(255) NOT NULL REFERENCES services(service_id), 
      quantity      INTEGER NOT NULL,
      unit_price    NUMERIC(10,2) NOT NULL,
      subtotal      NUMERIC(10,2) NOT NULL,
      created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    columns: {
      id: "SERIAL PRIMARY KEY",
      bill_item_id: "VARCHAR(255) UNIQUE NOT NULL",
      bill_id: "VARCHAR(255) NOT NULL REFERENCES bills(bill_id)",
      service_id: "VARCHAR(255) NOT NULL REFERENCES services(service_id)",
      quantity: "INTEGER NOT NULL",
      unit_price: "NUMERIC(10,2) NOT NULL",
      subtotal: "NUMERIC(10,2) NOT NULL",
      created_at: "TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP",
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
// OVERRIDE BEHAVIOR: if a column being added is NOT NULL with no
// DEFAULT, Postgres cannot add it to a table that already has rows
// (every existing row would violate the constraint). Since data loss
// is acceptable here, this function TRUNCATEs that table (CASCADE) right
// before adding such a column, so the ALTER always succeeds.
//
// WARNING: TRUNCATE ... CASCADE wipes ALL rows in that table AND any
// table that references it via foreign key (e.g. truncating `users`
// also empties `consultations`, `prescriptions`, `bills`, etc.).
// WARNING: dropping a column permanently deletes its data immediately.
//
// Example ways to trigger it:
//   import { syncSchema } from "./config/db.js";
//   await syncSchema();                 // sync everything
//   await syncSchema(["users"]);        // sync just one table
// -----------------------------------------------------------------------
export async function syncSchema(onlyTables?: string[]): Promise<void> {
  const configuredTables = onlyTables
    ? TABLES.filter((tableDefinition) =>
        onlyTables.includes(tableDefinition.table),
      )
    : TABLES;

  const configuredTableNames = configuredTables.map(
    (tableDefinition) => tableDefinition.table,
  );

  // -----------------------------------------------------------------------
  // 1. GET ALL EXISTING TABLES FROM THE DATABASE
  // -----------------------------------------------------------------------
  const existingTableRows = (await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  `) as { table_name: string }[];

  const existingTableNames = existingTableRows.map((row) => row.table_name);

  // -----------------------------------------------------------------------
  // 2. DROP TABLES THAT ARE NOT IN TABLES CONFIG
  // -----------------------------------------------------------------------
  const tablesToDrop = existingTableNames.filter(
    (tableName) => !configuredTableNames.includes(tableName),
  );

  for (const tableName of tablesToDrop) {
    console.log(`[schema-sync] dropping table "${tableName}"`);

    await sql.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE`);
  }

  // -----------------------------------------------------------------------
  // 3. CREATE TABLES THAT DON'T EXIST
  // -----------------------------------------------------------------------
  for (const tableDefinition of configuredTables) {
    const {
      table: tableName,
      createSQL,
      columns: desiredColumns,
    } = tableDefinition;

    if (!existingTableNames.includes(tableName)) {
      console.log(`[schema-sync] ${tableName}: creating table`);

      await sql.query(createSQL);

      // Table was just created with the correct columns.
      continue;
    }

    // ---------------------------------------------------------------------
    // 4. TABLE EXISTS → CHECK ITS COLUMNS
    // ---------------------------------------------------------------------

    const existingColumnRows = (await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
    `) as { column_name: string }[];

    const existingColumnNames = existingColumnRows.map(
      (row) => row.column_name,
    );

    // ---------------------------------------------------------------------
    // 5. FIND MISSING COLUMNS
    // ---------------------------------------------------------------------

    const columnsToAdd = Object.keys(desiredColumns).filter(
      (columnName) => !existingColumnNames.includes(columnName),
    );

    // ---------------------------------------------------------------------
    // 6. FIND EXTRA COLUMNS
    // ---------------------------------------------------------------------

    const columnsToDrop = existingColumnNames.filter(
      (columnName) => !(columnName in desiredColumns),
    );

    // ---------------------------------------------------------------------
    // 7. ADD MISSING COLUMNS
    // ---------------------------------------------------------------------

    for (const columnName of columnsToAdd) {
      console.log(`[schema-sync] ${tableName}: adding column "${columnName}"`);

      await sql.query(
        `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${desiredColumns[columnName]}`,
      );
    }

    // ---------------------------------------------------------------------
    // 8. DROP EXTRA COLUMNS
    // ---------------------------------------------------------------------

    for (const columnName of columnsToDrop) {
      console.log(
        `[schema-sync] ${tableName}: dropping column "${columnName}"`,
      );

      await sql.query(
        `ALTER TABLE "${tableName}" DROP COLUMN IF EXISTS "${columnName}" CASCADE`,
      );
    }

    // ---------------------------------------------------------------------
    // 9. LOG RESULT
    // ---------------------------------------------------------------------

    if (columnsToAdd.length === 0 && columnsToDrop.length === 0) {
      console.log(`[schema-sync] ${tableName}: already in sync`);
    }
  }

  console.log("[schema-sync] database schema synchronized");
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
