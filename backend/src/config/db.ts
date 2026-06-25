import { neon } from "@neondatabase/serverless";

// import { Pool } from "pg";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}
///////////////==========================for neon db==============================

export const sql = neon(DATABASE_URL);

// sa users table nakalagay na deleted user. so pag nagdelete tayop ng user or any instances we should use delete instead we should just add
//
// UPDATE users
// SET deleted = TRUE
// WHERE user_id = 1;
export async function connectNeon(): Promise<void> {
  try {
    
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS patient (
        patient_id INT PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        contact_number VARCHAR(255) NOT NULL,
        email_address VARCHAR(255) NOT NULL,
        patient_records JSONB NOT NULL,

        FOREIGN KEY (patient_id)
          REFERENCES users(user_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS services (
        service_id SERIAL PRIMARY KEY,
        service_name VARCHAR(255) NOT NULL UNIQUE,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS laboratory_request (
        request_id VARCHAR(255) PRIMARY KEY,
        patient_id INT NOT NULL,
        service_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        request_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        cancelled BOOLEAN NOT NULL DEFAULT FALSE,
        cancellation_reason TEXT,
        call_queue_number VARCHAR(255) NOT NULL UNIQUE,

        FOREIGN KEY (patient_id)
          REFERENCES patient(patient_id),

        FOREIGN KEY (service_id)
          REFERENCES services(service_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS laboratory_result (
        result_id SERIAL PRIMARY KEY,
        request_id VARCHAR(255) NOT NULL UNIQUE,
        encoded_data TEXT NOT NULL,
        file_url TEXT NOT NULL,
        release_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        input_results JSONB NOT NULL,
        email_results VARCHAR(255) NOT NULL,

        FOREIGN KEY (request_id)
          REFERENCES laboratory_request(request_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS queue (
        queue_id SERIAL PRIMARY KEY,
        queue_number VARCHAR(255) NOT NULL UNIQUE,
        current_status VARCHAR(50) NOT NULL,
        priority_queue BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS consultation_request (
        consultation_id SERIAL PRIMARY KEY,
        result_id INT NOT NULL,
        call_queue_number VARCHAR(255) NOT NULL,
        retrieved_patient_data JSONB NOT NULL,
        input_results JSONB NOT NULL,
        input_prescription JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (result_id)
          REFERENCES laboratory_result(result_id),

        FOREIGN KEY (call_queue_number)
          REFERENCES queue(queue_number)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS billing (
        billing_id SERIAL PRIMARY KEY,
        patient_id INT NOT NULL,
        service_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        applied_discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        payment_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (patient_id)
          REFERENCES patient(patient_id),

        FOREIGN KEY (service_id)
          REFERENCES services(service_id)
      )
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing DB", error);
    process.exit(1);
  }
}

// await sql
//         CREATE TABLE users (
//             user_id SERIAL PRIMARY KEY,
//             username VARCHAR(255) NOT NULL,
//             password VARCHAR(255) NOT NULL,
//             role VARCHAR(50) NOT NULL,
//             deleted BOOLEAN NOT NULL DEFAULT FALSE,
//             created_at DATE NOT NULL DEFAULT CURRENT_DATE
//         );

//         CREATE TABLE laboratory_request (
//             request_id VARCHAR(255) PRIMARY KEY,
//             patient_id INT NOT NULL,
//             laboratory_service VARCHAR(255) NOT NULL,
//             status VARCHAR(50) NOT NULL,
//             request_at DATE NOT NULL DEFAULT CURRENT_DATE,
//             request_time TIME NOT NULL DEFAULT CURRENT_TIME,
//             cancelled BOOLEAN NOT NULL DEFAULT FALSE,
//             cancellation_reason TEXT,
//             call_queue_number VARCHAR(255) NOT NULL UNIQUE,

//             FOREIGN KEY (patient_id)
//                 REFERENCES users(user_id)
//         );
//         CREATE TABLE IF NOT EXISTS services (
//             service_id SERIAL PRIMARY KEY,
//             service_name VARCHAR(255) NOT NULL,
//             price DECIMAL(10, 2) NOT NULL,
//         );
//         CREATE TABLE IF NOT EXISTS billing (
//         service_name JSONB NOT NULL,
//         price DECIMAL(10, 2) NOT NULL,
//         total_amount DECIMAL(10, 2) NOT NULL,
//         applyed_discount DECIMAL(10, 2) NOT NULL,

//         payment_confirmation BOOLEAN NOT NULL DEFAULT FALSE,
//         )

//         CREATE TABLE IF NOT EXISTS laboratory_result (
//             result_id SERIAL PRIMARY KEY,
//             request_id VARCHAR(255) NOT NULL UNIQUE,
//             encoded_data TEXT NOT NULL,
//             file_url TEXT NOT NULL,
//             release_date DATE NOT NULL DEFAULT CURRENT_DATE,
//             release_time TIME NOT NULL DEFAULT CURRENT_TIME,
//             input_results JSONB NOT NULL,
//             email_results VARCHAR(255) NOT NULL,

//             FOREIGN KEY (request_id)
//                 REFERENCES laboratory_request(request_id)
//         );
//         CREATE TABLE IF NOT EXISTS queue(
//         queue_id SERIAL PRIMARY KEY,
//         queue_number VARCHAR(255) NOT NULL UNIQUE,
//         current_status VARCHAR(50) NOT NULL,
//         priority_queue BOOLEAN NOT NULL DEFAULT FALSE,
//         laboratory_exam_queue JSONB NOT NULL,
//         laboratory_result_queue JSONB NOT NULL,
//         consultation_queue JSONB NOT NULL,
//         )

//         CREATE TABLE IF NOT EXISTS consultation_request (
//             request_id SERIAL PRIMARY KEY,
//             result_id INT NOT NULL,
//             retrieved_patient_data JSONB NOT NULL,
//             call_queue_number VARCHAR(255) NOT NULL UNIQUE,
//             input_results JSONB NOT NULL,
//             input_prescription JSONB NOT NULL,
//             FOREIGN KEY (result_id)
//                 REFERENCES laboratory_result(result_id)
//             FOREIGN KEY (call_queue_number)
//                 REFERENCES queue(queue_number)
//         );
//         CREATE TABLE IF NOT EXISTS  patient (
//             patient_id PRIMARY KEY,
//             frst_name VARCHAR(255) NOT NULL,
//             last_name VARCHAR(255) NOT NULL,
//             date_of_birth DATE NOT NULL,
//             qrcode_id VARCHAR(255) NOT NULL UNIQUE,
//             contact_number VARCHAR(255) NOT NULL,
//             email_address VARCHAR(255) NOT NULL,
//             patient_records JSONB NOT NULL,

//             FOREIGN KEY (patient_id)
//                 REFERENCES laboratory_request(patient_id)
//         );
//         `;
// ///////////////==========================for local db==============================

// export const pool = new Pool({
//     connectionString: DATABASE_URL,
// });

// export async function connectLocalDB(): Promise<void> {
//     try {
//         await pool.query(`
//             CREATE TABLE IF NOT EXISTS transactions (
//                 id SERIAL PRIMARY KEY,
//                 email VARCHAR(255) NOT NULL,
//                 password VARCHAR(255) NOT NULL,
//                 amount DECIMAL(10,2) NOT NULL,
//                 category VARCHAR(255) NOT NULL,
//                 created_at DATE NOT NULL DEFAULT CURRENT_DATE
//             )
//         `);

//         console.log("Database initialized successfully on local DB");
//     } catch (error) {
//         console.error("Error initializing DB", error);
//         process.exit(1);
//     }
// }

// old

//  await sql`
//           CREATE TABLE IF NOT EXISTS users (
//               user_id SERIAL PRIMARY KEY,
//               username VARCHAR(255) NOT NULL,
//               password VARCHAR(255) NOT NULL,
//               role VARCHAR(50) NOT NULL,
//               created_at DATE NOT NULL DEFAULT CURRENT_DATE
//               FOREIGN KEY (user_id) REFERENCES laboratory_request(patient_id) ON DELETE CASCADE
//           );
//                       CREATE TABLE laboratory_request (
//               request_id VARCHAR(255) PRIMARY KEY,
//               patient_id INT NOT NULL,
//               laboratory_service VARCHAR(255) NOT NULL,
//               status VARCHAR(50) NOT NULL,
//               request_at DATE NOT NULL DEFAULT CURRENT_DATE,
//               request_time TIME NOT NULL DEFAULT CURRENT_TIME,
//               cancelled BOOLEAN NOT NULL DEFAULT FALSE,
//               cancellation_reason TEXT,
//               call_queue_number VARCHAR(255) NOT NULL UNIQUE,

//               FOREIGN KEY (patient_id)
//                   REFERENCES users(user_id)
//                   ON DELETE CASCADE
//           );CREATE TABLE IF NOT EXISTS laboratory_request (
//               patient_id VARCHAR(255) PRIMARY KEY,
//               request_id VARCHAR(255) NOT NULL UNIQUE,
//               laboratory_service VARCHAR(255) NOT NULL,
//               status VARCHAR(50) NOT NULL,
//               request_at DATE NOT NULL DEFAULT CURRENT_DATE,
//               request_time TIME NOT NULL DEFAULT CURRENT_TIME,
//               cancelled BOOLEAN NOT NULL DEFAULT FALSE,
//               cancellation_reason TEXT,
//               call_queue_number VARCHAR(255) NOT NULL UNIQUE
//               FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE
//           );
//           CREATE TABLE IF NOT EXISTS laboratory_result (
//               request_id VARCHAR(255) NOT NULL,
//               result_id SERIAL PRIMARY KEY,
//               encoded_data TEXT NOT NULL,
//               file_url TEXT NOT NULL,
//               release_date DATE NOT NULL DEFAULT CURRENT_DATE,
//               release_time TIME NOT NULL DEFAULT CURRENT_TIME,
//               input_results JSONB NOT NULL,
//               email_results VARCHAR(255) NOT NULL,
//               FOREIGN KEY (request_id) REFERENCES laboratory_request(request_id) ON DELETE );
//           CREATE TABLE IF NOT EXISTS consultation_request (
//               request_id SERIAL PRIMARY KEY,
//               result_id
//           );
