import { sql } from "../../config/db.js";
import { json, Request, Response } from "express";

export async function getAllLaboratoryPaid(req: Request, res: Response) {
  try {
    const labRequests = await sql`
        SELECT request_id, patient_id, doctor_id, test_type, status, requested_at, updated_at
        FROM lab_requests
        WHERE is_paid = TRUE AND
              status != 'Requested' AND
              requested_at >= CURRENT_DATE
              AND requested_at < CURRENT_DATE + INTERVAL '1 day'
        ORDER BY updated_at ASC;
    `;
    if (labRequests.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(labRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getLaboratoryRequest(req: Request, res: Response) {
  try {
    const { request_id } = req.params;
    const [lab_req] = await sql`
        SELECT request_id, consultation_id, patient_id, doctor_id, test_type,
        results, status, requested_at, updated_at
        FROM lab_requests
        WHERE request_id = ${request_id}
    `;
    if (!lab_req) {
      return res.status(404).json({ message: "Laboratory request not found" });
    }
    return res.status(200).json(lab_req);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getPatientInfo(req: Request, res: Response) {
  try {
    const { patient_id } = req.params;
    const [patient] = await sql`
        SELECT patient_id, last_name, first_name, date_of_birth, sex, contact_number, email, address, emergency_contact
        FROM patients
        WHERE patient_id = ${patient_id}
    `;
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    return res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
