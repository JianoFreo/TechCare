import { sql } from "../../config/db.js";
import { json, Request, Response } from "express";

export async function getAllLaboratoryRequests(req: Request, res: Response) {
  try {
    const labRequests = await sql`
        SELECT request_id, patient_id, doctor_id, test_type, status, requested_at, updated_at
        FROM lab_requests
        WHERE is_paid = TRUE AND
              status != 'Requested' and
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
