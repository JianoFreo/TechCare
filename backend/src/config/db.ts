import { neon } from "@neondatabase/serverless";
// import { Pool } from "pg";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}

///////////////==========================for neon db==============================

export const sql = neon(DATABASE_URL);

export async function connectNeon(): Promise<void> {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at DATE NOT NULL DEFAULT CURRENT_DATE
            )
        `;

        console.log("Database initialized successfully on Neon DB");
    } catch (error) {
        console.error("Error initializing DB", error);
        process.exit(1);
    }
}

///////////////==========================for local db==============================

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