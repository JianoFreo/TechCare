import { sql } from "../../config/db.js";
import { calculateAge } from "../../utils/calculateAge.js";
import { json, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function addPatient(req: Request, res: Response) {
    // POST /api/fdstaff/patients
    try {
        const {
            patient_id,
            last_name,
            first_name,
            date_of_birth,
            sex,
            contact_number,
            email,
            address,
            emergency_contact,
            qr_code,
        } = req.body;

        // Validate required fields
        if (
            !patient_id ||
            !last_name ||
            !first_name ||
            !date_of_birth ||
            !sex
        ) {
            return res.status(400).json({
                message: "patient_id, last_name, first_name, date_of_birth, and sex are required.",
            });
        }

        // Check if patient already exists
        const existingPatient = await sql`
            SELECT patient_id
            FROM patients
            WHERE patient_id = ${patient_id};
        `;

        if (existingPatient.length > 0) {
            return res.status(409).json({
                message: "Patient ID already exists.",
            });
        }

        // Insert patient
        const response = await sql`
            INSERT INTO patients (
                patient_id,
                last_name,
                first_name,
                date_of_birth,
                sex,
                contact_number,
                email,
                address,
                emergency_contact
            )
            VALUES (
                ${patient_id},
                ${last_name},
                ${first_name},
                ${date_of_birth},
                ${sex},
                ${contact_number ?? null},
                ${email ?? null},
                ${address ?? null},
                ${emergency_contact ?? null},
            )
            RETURNING *;
        `;
        const age = calculateAge(date_of_birth);

        return res.status(201).json({
            message: "Patient added successfully.",
            patient: { ...response[0], age },
        });
        // {
        //     "message": "Patient added successfully.",
        //     "patient": {
        //         "patient_id": "P-2024-0427-001",
        //         "last_name": "Doe",
        //         "first_name": "John",
        //         "date_of_birth": "1990-01-01",
        //         "sex": "Male",
        //         "contact_number": "09123456789",
        //         "email": "patient@example.com",
        //         "address": "123 Main St",
        //         "emergency_contact": "Jane Doe",
        //         "created_at": "2024-04-27T12:34:56.789Z",
        //         "updated_at": "2024-04-27T12:34:56.789Z",
        //     }
        // }
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error.",
        });
    }
}