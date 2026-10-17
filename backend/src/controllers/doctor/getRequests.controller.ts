import { sql } from "../../config/db.js";
import type { Request, Response } from "express";
import type {
  getMedicalHistory,
  getMedicalHistoryDetails,
  getMedicalHistoryFull,
} from "./dto/get.dto.js";

export async function getMedicalHistory(
  req: Request<
    getMedicalHistory.params,
    getMedicalHistory.response | getMedicalHistory.error,
    object,
    getMedicalHistory.query
  >,
  res: Response<getMedicalHistory.response | getMedicalHistory.error>,
) {
  try {
    const { patient_id } = req.params;
    const {
      search,
      service_category,
      status,
      start_date,
      end_date,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    const offset = (pageNum - 1) * limitNum;

    const rows = await sql`
      WITH history AS (
        SELECT
          'consultation'::text AS record_type,
          cr.consultation_record_id::text AS record_id,
          s.service_name::text AS service_name,
          s.room::text AS room,
          'Consultation'::text AS service_category,
          'Completed'::text AS status,
          cr.consulted_at AS occurred_at
        FROM consultation_records cr
        JOIN services s ON s.service_id = cr.service_id
        WHERE cr.patient_id = ${patient_id}

        UNION ALL

        SELECT
          'laboratory'::text,
          lri.lab_item_id::text,
          s.service_name::text,
          s.room::text,
          'Laboratory'::text,
          lri.status::text,
          lr.requested_at
        FROM laboratory_request_items lri
        JOIN laboratory_requests lr ON lr.request_id = lri.request_id
        JOIN services s ON s.service_id = lri.service_id
        WHERE lr.patient_id = ${patient_id}
      )
      SELECT *, COUNT(*) OVER() AS total_count
      FROM history
      WHERE TRUE
        ${search ? sql`AND service_name ILIKE ${"%" + search + "%"}` : sql``}
        ${service_category ? sql`AND service_category = ${service_category}` : sql``}
        ${status ? sql`AND status = ${status}` : sql``}
        ${start_date ? sql`AND occurred_at >= ${start_date}::date` : sql``}
        ${end_date ? sql`AND occurred_at < (${end_date}::date + INTERVAL '1 day')` : sql``}
      ORDER BY occurred_at DESC
      LIMIT ${limitNum} OFFSET ${offset}
    `;

    const total = rows.length ? Number(rows[0].total_count) : 0;

    return res.status(200).json({
      message: "Medical history successfully fetched.",
      records: rows.map((row) => ({
        record_type: row.record_type,
        record_id: row.record_id,
        service_name: row.service_name,
        room: row.room,
        service_category: row.service_category,
        status: row.status,
        occurred_at: String(row.occurred_at),
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching medical history:", error);

    return res.status(500).json({
      message: "Failed to fetch medical history",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getMedicalHistoryDetails(
  req: Request<
    getMedicalHistoryDetails.params,
    getMedicalHistoryDetails.response | getMedicalHistoryDetails.error
  >,
  res: Response<
    getMedicalHistoryDetails.response | getMedicalHistoryDetails.error
  >,
) {
  try {
    const { record_type, record_id } = req.params;

    if (record_type === "laboratory") {
      const [labDetails] = await sql`
        SELECT
          lri.lab_item_id,
          lri.status,
          lri.updated_at,
          s.service_name,
          s.room,
          CONCAT_WS(' ', req_u.first_name, req_u.last_name) AS requested_by,
          req_u.role AS requested_by_role,
          CONCAT_WS(' ', proc_u.first_name, proc_u.last_name) AS processed_by,
          proc_u.role AS processed_by_role
        FROM laboratory_request_items lri
        JOIN services s ON s.service_id = lri.service_id
        JOIN laboratory_requests lr ON lr.request_id = lri.request_id
        LEFT JOIN users req_u ON req_u.user_id = lr.requested_by
        LEFT JOIN users proc_u ON proc_u.user_id = lri.processed_by
        WHERE lri.lab_item_id = ${record_id}
      `;

      if (!labDetails) {
        return res.status(404).json({
          message: "Laboratory record not found.",
        });
      }

      const results = await sql`
        SELECT
          result_id,
          result_value,
          unit,
          reference_range,
          flag,
          remarks,
          verified_by,
          verified_at,
          image_url,
          created_at
        FROM laboratory_results
        WHERE lab_item_id = ${record_id}
        ORDER BY created_at
      `;

      return res.status(200).json({
        message: "Laboratory record and result/s successfully fetched",
        record_type: "laboratory",
        lab_item_id: String(labDetails.lab_item_id),
        status: String(labDetails.status),
        updated_at: String(labDetails.updated_at),
        service_name: String(labDetails.service_name),
        room: labDetails.room,
        requested_by: labDetails.requested_by,
        requested_by_role: labDetails.requested_by_role,
        processed_by: labDetails.processed_by,
        processed_by_role: labDetails.processed_by_role,
        results: results.map((row) => ({
          result_id: Number(row.result_id),
          result_value: row.result_value,
          unit: row.unit,
          reference_range: row.reference_range,
          flag: row.flag,
          remarks: row.remarks,
          verified_by: row.verified_by,
          verified_at: row.verified_at ? String(row.verified_at) : null,
          image_url: row.image_url,
          created_at: String(row.created_at),
        })),
      });
    }

    if (record_type === "consultation") {
      const [consDetails] = await sql`
        SELECT
          cr.consultation_record_id,
          cr.consultation_type,
          cr.diagnosis,
          cr.notes,
          cr.consulted_at,
          s.service_name,
          s.room,
          CONCAT_WS(' ', u.first_name, u.last_name) AS consulted_by
        FROM consultation_records cr
        JOIN services s ON s.service_id = cr.service_id
        LEFT JOIN users u ON u.user_id = cr.doctor_id
        WHERE cr.consultation_record_id = ${record_id}
      `;

      if (!consDetails) {
        return res.status(404).json({
          message: "Consultation record not found.",
        });
      }

      const prescription = await sql`
        SELECT
          p.prescription_id,
          p.prescription_items,
          p.notes,
          p.valid_until,
          p.prescribed_at,
          CONCAT_WS(' ', u.first_name, u.last_name) AS prescribed_by
        FROM prescription_records p
        LEFT JOIN users u ON u.user_id = p.prescriber_id
        WHERE p.consultation_record_id = ${record_id}
        ORDER BY p.id
      `;

      return res.status(200).json({
        message: "Consultation record and prescription/s successfully fetched",
        record_type: "consultation",
        consultation_record_id: String(consDetails.consultation_record_id),
        consultation_type: String(consDetails.consultation_type),
        diagnosis: consDetails.diagnosis,
        notes: consDetails.notes,
        consulted_at: String(consDetails.consulted_at),
        service_name: String(consDetails.service_name),
        room: consDetails.room,
        consulted_by: consDetails.consulted_by,
        prescription: prescription.map((row) => ({
          prescription_id: String(row.prescription_id),
          prescription_items: row.prescription_items,
          notes: row.notes,
          valid_until: row.valid_until,
          prescribed_at: String(row.prescribed_at),
          prescribed_by: row.prescribed_by,
        })),
      });
    }

    return res.status(400).json({
      message: "Invalid record type.",
    });
  } catch (error) {
    console.error("Error fetching medical history details:", error);

    return res.status(500).json({
      message: "Failed to fetch medical history details",
    });
  }
}

export async function getMedicalHistoryFull(
  req: Request<
    getMedicalHistoryFull.params,
    getMedicalHistoryFull.response | getMedicalHistoryFull.error
  >,
  res: Response<
    getMedicalHistoryFull.response | getMedicalHistoryFull.error
  >,
) {
  try {
    const { record_type, record_id } = req.params;

    if (record_type === "laboratory") {
      const [fullLab] = await sql`
        SELECT
          lri.lab_item_id,
          lri.status,
          lri.updated_at,
          lr.result_value,
          lr.remarks,
          lr.verified_by,
          lr.verified_at,
          s.service_name,
          s.room,
          CONCAT_WS(' ', req_u.first_name, req_u.last_name) AS requested_by,
          req_u.role AS requested_by_role,
          CONCAT_WS(' ', proc_u.first_name, proc_u.last_name) AS processed_by,
          proc_u.role AS processed_by_role
        FROM laboratory_request_items lri
        JOIN services s ON s.service_id = lri.service_id
        JOIN laboratory_requests lr ON lr.request_id = lri.request_id
        LEFT JOIN users req_u ON req_u.user_id = lr.requested_by
        LEFT JOIN users proc_u ON proc_u.user_id = lri.processed_by
        WHERE lri.lab_item_id = ${record_id}
      `;

      if (!fullLab) {
        return res.status(404).json({
          message: "Laboratory record not found.",
        });
      }

      return res.status(200).json({
        message: "Full laboratory details successfully fetched",
        record_type: "laboratory",
        lab_item_id: String(fullLab.lab_item_id),
        status: String(fullLab.status),
        updated_at: String(fullLab.updated_at),
        result_value: fullLab.result_value,
        remarks: fullLab.remarks,
        verified_by: fullLab.verified_by,
        verified_at: fullLab.verified_at
          ? String(fullLab.verified_at)
          : null,
        service_name: String(fullLab.service_name),
        room: fullLab.room,
        requested_by: fullLab.requested_by,
        requested_by_role: fullLab.requested_by_role,
        processed_by: fullLab.processed_by,
        processed_by_role: fullLab.processed_by_role,
      });
    }

    if (record_type === "consultation") {
      const [consDetails] = await sql`
        SELECT
          cr.consultation_record_id,
          cr.consultation_type,
          cr.diagnosis,
          cr.notes,
          cr.consulted_at,
          cr.presenting_complaint,
          cr.vital_signs,
          cr.physical_examination,
          s.service_name,
          s.room,
          CONCAT_WS(' ', u.first_name, u.last_name) AS consulted_by
        FROM consultation_records cr
        JOIN services s ON s.service_id = cr.service_id
        LEFT JOIN users u ON u.user_id = cr.doctor_id
        WHERE cr.consultation_record_id = ${record_id}
      `;

      if (!consDetails) {
        return res.status(404).json({
          message: "Consultation record not found.",
        });
      }

      const prescription = await sql`
        SELECT
          p.prescription_id,
          p.prescription_items,
          p.notes,
          p.valid_until,
          p.prescribed_at,
          CONCAT_WS(' ', u.first_name, u.last_name) AS prescribed_by
        FROM prescription_records p
        LEFT JOIN users u ON u.user_id = p.prescriber_id
        WHERE p.consultation_record_id = ${record_id}
        ORDER BY p.id
      `;

      return res.status(200).json({
        message: "Full consultation details successfully fetched",
        record_type: "consultation",
        consultation_record_id: String(consDetails.consultation_record_id),
        consultation_type: String(consDetails.consultation_type),
        diagnosis: consDetails.diagnosis,
        notes: consDetails.notes,
        consulted_at: String(consDetails.consulted_at),
        presenting_complaint: consDetails.presenting_complaint,
        vital_signs: consDetails.vital_signs,
        physical_examination: consDetails.physical_examination,
        service_name: String(consDetails.service_name),
        room: consDetails.room,
        consulted_by: consDetails.consulted_by,
        prescription: prescription.map((row) => ({
          prescription_id: String(row.prescription_id),
          prescription_items: row.prescription_items,
          notes: row.notes,
          valid_until: row.valid_until,
          prescribed_at: String(row.prescribed_at),
          prescribed_by: row.prescribed_by,
        })),
      });
    }

    return res.status(400).json({
      message: "Invalid record type.",
    });
  } catch (error) {
    console.error("Error fetching full medical history:", error);

    return res.status(500).json({
      message: "Failed to fetch full medical history",
    });
  }
}
