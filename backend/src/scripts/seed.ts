
import fs from "node:fs";
import { ENV } from "../config/env.js";
import { connectNeon, pool } from "../config/db.js";

// Usage:
//   npm run seed
//   npm run seed:reset -- --force
//   npx tsx src/scripts/seed.ts --reset --force

const args = new Set(process.argv.slice(2));
const reset = args.has("--reset");
const force = args.has("--force");

const WIPE = `
  TRUNCATE activity_logs, actions, system_activity, bills, laboratory_results,
           form_components, form_templates, form_component_types,
           laboratory_request_items, laboratory_requests, prescription_records,
           consultation_records, queue_entries, services, patients, users
  RESTART IDENTITY CASCADE;
`;

/**
 * The existing queue_entries table does not contain service_id.
 *
 * Keep seed.sql unchanged and adapt only its queue_entries INSERT statement
 * before executing it. The service relationship remains in the appropriate
 * consultation and laboratory records.
 */
function adaptSeedSql(sql: string): string {
  const insertPattern =
    /INSERT\s+INTO\s+queue_entries\s*\(([^)]*)\)\s*VALUES([\s\S]*?)ON\s+CONFLICT\s+DO\s+NOTHING\s*;/i;

  const match = sql.match(insertPattern);

  if (!match) {
    throw new Error(
      "Could not find the queue_entries INSERT statement in seed.sql."
    );
  }

  const columns = match[1]
    .split(",")
    .map((column) => column.trim());

  const serviceIdIndex = columns.findIndex(
    (column) => column.toLowerCase() === "service_id"
  );

  if (serviceIdIndex === -1) {
    // The seed SQL has already been adapted.
    return sql;
  }

  // Remove service_id from the INSERT column list.
  columns.splice(serviceIdIndex, 1);

  let values = match[2];

  /*
   * Each queue row begins with:
   *   (queue_id, patient_id, queue_number, service_id, ...)
   *
   * The queue IDs, patient IDs, and service IDs in the existing seed data
   * are strings. Remove only the fourth value from each queue row.
   */
  values = values.replace(
    /(\(\s*'[^']*'\s*,\s*'[^']*'\s*,\s*\d+)\s*,\s*'[^']*'/g,
    "$1"
  );

  const adaptedInsert = `
INSERT INTO queue_entries (${columns.join(", ")})
VALUES${values}
ON CONFLICT DO NOTHING;`;

  return sql.replace(match[0], adaptedInsert);
}

async function main() {
  if ((ENV.IS_PRODUCTION || ENV.NODE_ENV === "production") && !force) {
    console.error(
      "Refusing to seed a production environment. " +
        "Re-run with --force if you really mean it."
    );
    process.exit(1);
  }

  const seedSql = fs.readFileSync(
    new URL("../seed/seed.sql", import.meta.url),
    "utf8"
  );

  const adaptedSql = adaptSeedSql(seedSql);

  console.log("Ensuring tables exist...");
  await connectNeon();

  const client = await pool.connect();

  try {
    if (reset) {
      console.log("Wiping existing data...");
      await client.query(WIPE);
    }

    console.log("Inserting seed data...");
    await client.query(adaptedSql);

    const { rows } = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM patients) AS patients,
        (SELECT COUNT(*) FROM services) AS services,
        (SELECT COUNT(*) FROM queue_entries) AS queue_entries,
        (SELECT COUNT(*) FROM consultation_records) AS consultations,
        (SELECT COUNT(*) FROM laboratory_requests) AS lab_requests,
        (SELECT COUNT(*) FROM bills) AS bills
    `);

    console.log("Done. Row counts:", rows[0]);
    console.log(
      "\nLogin with the seed accounts configured in seed.sql " +
        "(password: password, if configured there)."
    );
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
