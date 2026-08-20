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

export async function getAllLaboratoryQueues(req: Request, res: Response) {
  try {
    const laboratoryQueue = await sql`
        SELECT * FROM queue_entries
        WHERE queue_id LIKE 'LAB-%'
              AND created_at >= CURRENT_DATE
              AND created_at < CURRENT_DATE + INTERVAL '1 day'
        ORDER BY queue_number ASC
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

    // {
    //   "services": [
    //   {
    //     "service_id": 1,
    //     "service_name": "Haircut",
    //     "price": "250.00",
    //     "discount_pct": "0.00",
    //     "deleted": false,
    //     "created_at": "2026-07-02T08:00:00.000Z",
    //     "updated_at": "2026-07-02T08:00:00.000Z"
    //   },
    //   {
    //     "service_id": 2,
    //     "service_name": "Hair Coloring",
    //     "price": "1200.00",
    //     "discount_pct": "10.00",
    //     "deleted": false,
    //     "created_at": "2026-07-02T08:05:00.000Z",
    //     "updated_at": "2026-07-02T08:05:00.000Z"
    //   }
    // ]
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
