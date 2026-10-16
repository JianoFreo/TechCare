import { sql } from "../../config/db.js";
import { Request, Response } from "express";

export async function getLaboratoryRequestDetails(req: Request, res: Response) {
  try {
    const { queue_id } = req.params;
    const room = typeof req.query.room === "string" ? req.query.room : "";

    if (!room) {
      return res.status(400).json({ message: "room is required" });
    }

    const result = await sql`
      SELECT
        json_build_object(
          'request', json_build_object(
            'request_id', lr.request_id,
            'consultation_record_id', lr.consultation_record_id,
            'requested_by', lr.requested_by,
            'is_priority', q.is_priority,
            'status', q.status,
            'is_paid', lr.is_paid,
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
          'items', COALESCE((
            SELECT json_agg(
              json_build_object(
                'lab_item_id', ri.lab_item_id,
                'queue_id', ri.queue_id,
                'status', ri.status,
                'processed_by', ri.processed_by,
                'created_at', ri.created_at,
                'updated_at', ri.updated_at,
                'in_current_room', (s.room = ${room}),
                'service', json_build_object(
                  'service_id', s.service_id,
                  'service_name', s.service_name,
                  'service_type', s.service_type,
                  'service_category', s.service_category,
                  'room', s.room
                )
              )
              ORDER BY (s.room = ${room}) DESC, ri.created_at ASC
            )
            FROM laboratory_request_items ri
            JOIN services s ON s.service_id = ri.service_id
            WHERE ri.request_id = lr.request_id
          ), '[]'::json)
        ) AS response
      FROM queue_entries q
      JOIN laboratory_requests lr ON lr.request_id = (
        SELECT ri2.request_id
        FROM laboratory_request_items ri2
        WHERE ri2.queue_id = q.queue_id
        LIMIT 1
      )
      JOIN patients p ON p.patient_id = lr.patient_id
      WHERE q.queue_id = ${queue_id}
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Laboratory request not found" });
    }

    return res.status(200).json(result[0].response);
  } catch (error) {
    console.error("getLaboratoryRequestDetails:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getLaboratoryQueues(req: Request, res: Response) {
  try {
    const { room } = req.params;

    const queues = await sql`
      SELECT
        q.*,
        s.service_name,
        s.service_type,
        s.service_category,
        s.room
      FROM queue_entries q
      JOIN services s ON s.service_id = q.service_id
      WHERE q.queue_id LIKE 'LAB-%'
        AND s.room = ${room}
        AND q.created_at >= CURRENT_DATE
        AND q.created_at < CURRENT_DATE + INTERVAL '1 day'
      ORDER BY q.queue_number ASC
    `;

    return res.status(200).json(queues);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
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

    const items = await sql`
      SELECT
        ri.lab_item_id,
        ri.request_id,
        ri.queue_id,
        ri.service_id,
        ri.processed_by,
        ri.status,
        ri.created_at,
        ri.updated_at,
        s.service_name,
        s.service_type,
        s.service_category,
        s.room
      FROM laboratory_request_items ri
      JOIN services s ON s.service_id = ri.service_id
      WHERE ri.queue_id = ${queue_id}
      ORDER BY ri.created_at ASC
    `;

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAnalysisReadyRequests(req: Request, res: Response) {
  try {
    const analysisReadyRequests = await sql`
      SELECT
        ri.lab_item_id,
        ri.request_id,
        ri.service_id,
        s.room,
        ri.queue_id,
        ri.processed_by,
        ri.status,
        ri.created_at,
        ri.updated_at
      FROM laboratory_request_items ri
      JOIN services s ON s.service_id = ri.service_id
      WHERE ri.status = 'Collected'
      ORDER BY ri.created_at ASC
    `;

    return res.status(200).json(analysisReadyRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAvailableFormTemplates(req: Request, res: Response) {
  try {
    const templates = await sql`
      SELECT
        ft.form_id,
        ft.form_name,
        ft.form_description,
        ft.service_id,
        s.service_name,
        ft.version,
        ft.created_by,
        ft.created_at,
        ft.updated_at
      FROM form_templates ft
      JOIN services s ON s.service_id = ft.service_id
      WHERE ft.status = 'Published'
      ORDER BY ft.version DESC, ft.form_name ASC
    `;

    return res.status(200).json(templates);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
// IMPORTANT: Fetches laboratory results only after they have been released.
export async function getReleasedLaboratoryResults(
  req: Request,
  res: Response,
) {
  try {
    const results = await sql`
      SELECT
        result_id,
        lab_item_id,
        results,
        remarks,
        image_url,
        verified_by,
        verified_at,
        created_at,
        updated_at
      FROM laboratory_results
      WHERE status = 'Released'
      ORDER BY updated_at DESC;
    `;

    return res.status(200).json({
      message: "Released laboratory results fetched successfully.",
      results,
    });
  } catch (error) {
    console.error("Unable to fetch released laboratory results:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
