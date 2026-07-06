import { sql } from "../../config/db.js";
import { json, Request, Response } from "express";
import { calculateAge } from "../../utils/calculateAge.js";
export async function updatePatient(req: Request, res: Response) {
    // PUT /api/fdstaff/patients/:patient_id

    try {
        const { patient_id } = req.params;

        const {
            last_name,
            first_name,
            date_of_birth,
            sex,
            contact_number,
            email,
            address,
            emergency_contact,
        } = req.body;

        if (
            !last_name ||
            !first_name ||
            !date_of_birth ||
            !sex
        ) {
            return res.status(400).json({
                message: "Required fields are missing.",
            });
        }

        const existingPatient = await sql`
            SELECT patient_id
            FROM patients
            WHERE patient_id = ${patient_id}
        `;

        if (existingPatient.length === 0) {
            return res.status(404).json({
                message: "Patient not found.",
            });
        }

        const [updatedPatient] = await sql`
            UPDATE patients
            SET
                last_name = ${last_name},
                first_name = ${first_name},
                date_of_birth = ${date_of_birth},
                sex = ${sex},
                contact_number = ${contact_number},
                email = ${email},
                address = ${address},
                emergency_contact = ${emergency_contact},
                updated_at = CURRENT_TIMESTAMP
            WHERE patient_id = ${patient_id}
            RETURNING *;
        `;
        const age = calculateAge(updatedPatient.date_of_birth);

        return res.status(200).json({
            message: "Patient updated successfully.",
            patient: {...updatedPatient, age },
        });
        // {
        //     "message": "Patient updated successfully.",
        //     "patient": {
        //         "patient_id": "P-2026-0628-001",
        //         "last_name": "Doe",
        //         "first_name": "John",
        //         "date_of_birth": "1990-01-01",
        //         "sex": "Male",
        //         "contact_number": "1234567890",
        //         "email": "john.doe@example.com",
        //         "address": "123 Main St",
        //         "emergency_contact": "Jane Doe",
        //         "created_at": "2026-06-28T20:19:10.904Z",
        //         "updated_at": "2026-06-28T20:19:10.904Z"
        //     }
        // }

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error.",
        });
    }
}


export async function callQueueEntry(req: Request, res: Response) {
    try {  
        const { queue_id, queue_number,  } = req.body;

        const existingQueueEntry = await sql`
            UPDATE queue_entries
                SET status = 'calling' AND queue_number = 0
                WHERE queue_id = ${queue_id}
            RETURNING *;
        `;
        const updateQueueBehind = await sql`
            UPDATE queue_entries
                SET queue_number = queue_number - 1
                WHERE queue_number > ${queue_number}
            RETURNING *;
        `;
        res.status(200).json({ message: "Queue entry called successfully", existingQueueEntry, updateQueueBehind });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }


}