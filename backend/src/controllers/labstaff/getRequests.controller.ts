import { sql } from "../../config/db.js";
import { Request, Response } from "express";

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
        SELECT * FROM lab_requests
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

// export async function getPatientInfo(req: Request, res: Response) {
//   try {
//     const { patient_id } = req.params;
//     const [patient] = await sql`
//         SELECT patient_id, last_name, first_name, date_of_birth, sex, contact_number, email, address, emergency_contact
//         FROM patients
//         WHERE patient_id = ${patient_id}
//     `;
//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found" });
//     }
//     return res.status(200).json(patient);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// }

export async function getAllLaboratorySpecificQueues(
  req: Request,
  res: Response,
) {
  try {
    const { room } = req.params;

    const laboratoryQueue = await sql`
      SELECT DISTINCT ON (q.queue_id)
        q.*,
        s.room
      FROM queue_entries q
      JOIN request_items ri ON ri.queue_id = q.queue_id
      JOIN services s ON s.service_id = ri.service_id
      WHERE q.queue_id LIKE 'LAB-%'
        AND q.created_at >= CURRENT_DATE
        AND q.created_at < CURRENT_DATE + INTERVAL '1 day'
        AND s.room = ${room}
      ORDER BY q.queue_id, q.queue_number ASC
    `;
    if (laboratoryQueue.length === 0) {
      return res.status(404).json({ message: "No existing Queue" });
    }
    return res.status(200).json(laboratoryQueue);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getRoomSpecificServices(req: Request, res: Response) {
  const { room } = req.params;
  if (!room) {
    res.status(400).json({
      message: "Room field is required.",
    });
  }
  try {
    const services = await sql`
    SELECT * FROM services
    WHERE room = ${room}
    ORDER BY service_id ASC
      `;
    if (!services) {
      res.json({ message: "there are no services" });
    }
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getLaboratoryQueueItems(req: Request, res: Response) {
  try {
    const { queue_id } = req.params;

    const laboratoryItems = await sql`
      SELECT
        r.id,
        r.lab_item_id,
        r.status,
        r.created_at,
        r.updated_at,
        s.service_name,
        s.service_type
      FROM request_items r
      JOIN queue_entries q ON q.queue_id = r.queue_id
      JOIN services s ON s.service_id = r.service_id
      WHERE q.queue_id = ${queue_id}
        AND q.created_at >= CURRENT_DATE
        AND q.created_at < CURRENT_DATE + INTERVAL '1 day'
      ORDER BY r.lab_item_id
    `;
    if (laboratoryItems.length === 0) {
      return res.status(404).json({ message: "No existing Queue" });
    }
    return res.status(200).json(laboratoryItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
