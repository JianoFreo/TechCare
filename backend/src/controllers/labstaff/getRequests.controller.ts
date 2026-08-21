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
    const { queue_id } = req.params;

    const result = await sql`
  SELECT
    json_build_object(
      'request', json_build_object(
        'request_id', lr.request_id,
        'consultation_record_id', lr.consultation_record_id,
        'doctor_id', lr.doctor_id,
        'is_priority', q.is_priority,
        'status', q.status,
        'patient_id', p.patient_id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'middle_name', p.middle_name,
        'suffix', p.suffix,
        'sex', p.sex,
        'email', p.email,
        'contact_number', p.contact_number,
        'address', p.address,
        'blood_type', p.blood_type,
        'birthdate', p.birthdate,
        'emergency_contact_name', p.emergency_contact_name,
        'emergency_contact', p.emergency_contact,
        'requested_at', lr.requested_at,
        'updated_at', lr.updated_at
      ),
      'items', json_agg(
        json_build_object(
          'lab_item_id', r.lab_item_id,
          'status', r.status,
          'created_at', r.created_at,
          'updated_at', r.updated_at,
          'service', json_build_object(
            'service_name', s.service_name,
            'service_type', s.service_type,
            'room', s.room
          )
        )
      )
    ) AS response
  FROM queue_entries q
  JOIN request_items r ON r.queue_id = q.queue_id
  JOIN lab_requests lr ON lr.request_id = r.request_id
  JOIN patients p ON p.patient_id = lr.patient_id
  JOIN services s ON s.service_id = r.service_id
  WHERE q.queue_id = ${queue_id}
  GROUP BY
    lr.request_id,
    lr.consultation_record_id,
    lr.doctor_id,
    lr.requested_at,
    lr.updated_at,
    q.queue_id,
    q.queue_number,
    q.is_priority,
    q.status,
    q.created_at,
    q.updated_at,
    p.patient_id,
    p.first_name,
    p.last_name,
    p.middle_name,
    p.suffix,
    p.sex,
    p.email,
    p.contact_number,
    p.address,
    p.blood_type,
    p.birthdate,
    p.emergency_contact_name,
    p.emergency_contact;
`;
    if (result.length === 0) {
      return res.status(404).json({ message: "Laboratory request not found" });
    }

    // result[0].response is already the nested object you want
    return res.status(200).json(result[0].response);
  } catch (error) {
    console.error("getLaboratoryRequest:", error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
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
