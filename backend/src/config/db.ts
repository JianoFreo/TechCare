import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const sql = neon(DATABASE_URL);

export async function connectNeon(): Promise<void> {
  try {
    // -------------------------------------------------------
    // USERS
    // roles: Doctor | Lab Staff | Front Desk | Administrator
    // -------------------------------------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id        SERIAL PRIMARY KEY,
        username       VARCHAR(255) NOT NULL UNIQUE,
        password       VARCHAR(255) NOT NULL,
        role           VARCHAR(50)  NOT NULL,
        full_name      VARCHAR(255) NOT NULL,
        email          VARCHAR(255) NOT NULL UNIQUE,
        contact_number VARCHAR(20)  NOT NULL,
        created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

    // -------------------------------------------------------
    // PATIENTS
    // patient_id format: P-YYYY-MMDD-NNN
    // soft-delete: UPDATE patients SET deleted = TRUE WHERE patient_id = ?
    // -------------------------------------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS patients (
        patient_id        SERIAL PRIMARY KEY,
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
      )`;

    // -------------------------------------------------------
    // SERVICES
    // admin-managed catalogue with pricing
    // soft-delete: UPDATE services SET deleted = TRUE WHERE service_id = ?
    // -------------------------------------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS services (
        service_id   SERIAL PRIMARY KEY,
        service_name VARCHAR(255)  NOT NULL UNIQUE,
        price        DECIMAL(10,2) NOT NULL,
        active       BOOLEAN       NOT NULL DEFAULT TRUE,
        created_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

    // -------------------------------------------------------
    // QUEUE ENTRIES
    // one row per patient visit; LEFT JOIN patients, users
    // -------------------------------------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS queue_entries (
        queue_id     SERIAL PRIMARY KEY,
        patient_id   INTEGER     REFERENCES patients(patient_id),
        queue_number INTEGER     NOT NULL,
        service_type VARCHAR(50) NOT NULL REFERENCES services(service_id)
        is_priority  BOOLEAN     NOT NULL DEFAULT FALSE,
        status       VARCHAR(20) NOT NULL DEFAULT 'waiting',
        created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;
    
    // -------------------------------------------------------
    // CONSULTATIONS
    // findings + prescription merged into JSONB columns
    // LEFT JOIN patients, users (doctor), queue_entries
    //
    // findings shape:
    // {
    //   chief_complaint, physical_examination,
    //   blood_pressure, heart_rate, temperature, weight,
    //   clinical_findings, diagnosis, treatment_plan
    // }
    //
    // prescription shape:
    // {
    //   diagnosis, additional_instructions,
    //   items: [{ medication_name, dosage, frequency, duration }]
    // }
    // -------------------------------------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS consultations (
        consultation_id SERIAL PRIMARY KEY,
        patient_id      INTEGER     NOT NULL REFERENCES patients(patient_id),
        doctor_id       INTEGER     NOT NULL REFERENCES users(user_id),
        queue_id        INTEGER     UNIQUE   REFERENCES queue_entries(queue_id),
        reason          VARCHAR(500),
        findings        JSONB,
        prescription    JSONB,
        status          VARCHAR(20) NOT NULL DEFAULT 'Open',
        consulted_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

    // -------------------------------------------------------
    // LAB REQUESTS
    // results merged into JSONB column
    // LEFT JOIN patients, users (doctor + technician), consultations
    //
    // results shape:
    // {
    //   technician_id,
    //   red_blood_cells, white_blood_cells, platelets,
    //   hemoglobin, hematocrit, mcv, glucose, cholesterol,
    //   additional_findings, result_status, is_released
    // }
    // -------------------------------------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS lab_requests (
        request_id      SERIAL PRIMARY KEY,
        consultation_id INTEGER      REFERENCES consultations(consultation_id),
        patient_id      INTEGER      NOT NULL REFERENCES patients(patient_id),
        doctor_id       INTEGER      NOT NULL REFERENCES users(user_id),
        test_type       VARCHAR(200) NOT NULL,
        results         JSONB,
        status          VARCHAR(20)  NOT NULL DEFAULT 'Pending',
        requested_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

    // -------------------------------------------------------
    // BILLS
    // line items merged into JSONB column
    // receipt_issued_at replaces the receipts table
    // LEFT JOIN patients, users (created_by)
    //
    // items shape:
    // [{ service_id, service_name, unit_price }]
    // -------------------------------------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS bills (
          bill_id            SERIAL PRIMARY KEY,
          patient_id         INTEGER      NOT NULL REFERENCES patients(patient_id),
          items              JSONB        NOT NULL,
          discount_pct       DECIMAL(5,2)  NOT NULL DEFAULT 0,
          total_amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
          payment_method     VARCHAR(30)   NOT NULL DEFAULT 'Cash',
          status             VARCHAR(20)   NOT NULL DEFAULT 'Unpaid',
          receipt_id         VARCHAR(50)   UNIQUE,
          created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
          receipt_issued_at  TIMESTAMP,
          billed_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

    // -------------------------------------------------------
    // SYSTEM ACTIVITY
    // LEFT JOIN users, services
    // -------------------------------------------------------
    await sql`
      CREATE TABLE IF NOT EXISTS system_activity (
        activity_id  SERIAL PRIMARY KEY,
        user_id      INTEGER      NOT NULL REFERENCES users(user_id),
        service_name VARCHAR(255) NOT NULL REFERENCES services(service_name),
        details      JSONB        NOT NULL,
        created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing DB", error);
    process.exit(1);
  }
}