
import { pool, sql } from "../../config/db.js";
import type { Request, Response } from "express";
import {
  generateLaboratoryRequestID,
  generateLaboratoryItemID,
  generatePrescriptionId,
} from "../../utils/generateId.js";
import {
  validateLabRequest,
  validateFindings,
} from "../../utils/consultationValidation.js";
import { resolveDoctorId } from "../../utils/resolveDoctorId.js";
import { generateConsultationRecordID } from "../../utils/generateConsultationId.js";
import type {
  addLaboratoryRequest,
  addPrescriptions,
  addConsultationFindings,
} from "./dto/post.dto.js";

export async function addLaboratoryRequest(
  req: Request<
    object,
    addLaboratoryRequest.response | addLaboratoryRequest.error,
    addLaboratoryRequest.body
  >,
  res: Response<
    addLaboratoryRequest.response | addLaboratoryRequest.error
  >,
) {
  const validation = validateLabRequest(req.body);

  if (!validation.ok) {
    return res.status(400).json({
      message: "Validation failed.",
      errors: validation.errors,
    });
  }

  const requested_by = resolveDoctorId(req);

  if (!requested_by) {
    return res.status(401).json({
      message: "Doctor could not be identified.",
    });
  }

  const {
    patient_id,
    consultation_record_id,
    service_ids,
    priority,
    request_date,
    estimated_release_date,
  } = validation.value;

  try {
    const services = await sql`
      SELECT service_id, service_type, active
      FROM services
      WHERE service_id = ANY(${service_ids}::text[])
    `;

    const found = new Map(
      services.map((service) => [String(service.service_id), service]),
    );

    const unknown = service_ids.filter((id) => !found.has(id));

    if (unknown.length > 0) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: {
          services: `Unknown service: ${unknown.join(", ")}`,
        },
      });
    }

    const notLab = service_ids.filter((id) => {
      const service = found.get(id);

      return (
        !service ||
        !String(service.service_type)
          .toLowerCase()
          .startsWith("laboratory") ||
        !service.active
      );
    });

    if (notLab.length > 0) {
      return res.status(400).json({
        message: "Validation failed.",
        errors: {
          services: `Not an available laboratory test: ${notLab.join(", ")}`,
        },
      });
    }

    if (consultation_record_id) {
      const consultation = await sql`
        SELECT patient_id
        FROM consultation_records
        WHERE consultation_record_id = ${consultation_record_id}
      `;

      if (consultation.length === 0) {
        return res.status(404).json({
          message: "Consultation record not found.",
        });
      }

      if (consultation[0].patient_id !== patient_id) {
        return res.status(400).json({
          message: "Consultation record belongs to a different patient.",
        });
      }
    }
  } catch (error) {
    console.error("Error validating laboratory request:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext('lab_ids'))",
    );

    const request_id = await generateLaboratoryRequestID(client);

    const { rows: laboratory_request_result } = await client.query(
      `INSERT INTO laboratory_requests (
        request_id,
        consultation_record_id,
        patient_id,
        requested_by,
        is_priority,
        request_date,
        estimated_release_date
      )
      VALUES (
        $1, $2, $3, $4, $5,
        COALESCE($6::date, CURRENT_DATE),
        $7::date
      )
      RETURNING
        id,
        request_id,
        consultation_record_id,
        patient_id,
        requested_by,
        status,
        is_paid,
        is_priority,
        to_char(request_date, 'YYYY-MM-DD') AS request_date,
        to_char(estimated_release_date, 'YYYY-MM-DD')
          AS estimated_release_date,
        requested_at,
        updated_at`,
      [
        request_id,
        consultation_record_id,
        patient_id,
        requested_by,
        priority === "Yes",
        request_date,
        estimated_release_date,
      ],
    );

    const laboratory_item_result: addLaboratoryRequest.item[] = [];

    for (const service_id of service_ids) {
      const lab_item_id = await generateLaboratoryItemID(client);

      const { rows } = await client.query(
        `INSERT INTO laboratory_request_items (
          lab_item_id,
          request_id,
          service_id,
          status
        )
        VALUES ($1, $2, $3, 'Requested')
        RETURNING *`,
        [lab_item_id, request_id, service_id],
      );

      laboratory_item_result.push(
        rows[0] as addLaboratoryRequest.item,
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Laboratory request added successfully.",
      request: laboratory_request_result,
      items: laboratory_item_result,
    } as addLaboratoryRequest.response);
  } catch (error) {
    console.error("Error adding laboratory request:", error);

    await client.query("ROLLBACK").catch(console.error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return res.status(400).json({
        message: "Invalid patient, doctor or service ID.",
      });
    }

    return res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    client.release();
  }
}

export async function addPrescriptions(
  req: Request<
    { consultation_record_id: string },
    addPrescriptions.response | addPrescriptions.error,
    addPrescriptions.body
  >,
  res: Response<
    addPrescriptions.response | addPrescriptions.error
  >,
) {
  const { consultation_record_id } = req.params;
  const { items, valid_until = null, notes = null } = req.body;
  const user_id = req.user?.user_id;

  if (!consultation_record_id) {
    return res.status(400).json({
      message: "Consultation record ID is required.",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "At least one medication is required.",
    });
  }

  const cleanItems: addPrescriptions.item[] = [];

  for (const item of items) {
    const medication =
      typeof item.medication === "string" ? item.medication.trim() : "";
    const dosage =
      typeof item.dosage === "string" ? item.dosage.trim() : "";
    const frequency =
      typeof item.frequency === "string" ? item.frequency.trim() : "";
    const duration =
      typeof item.duration === "string" ? item.duration.trim() : undefined;
    const instructions =
      typeof item.instructions === "string"
        ? item.instructions.trim()
        : undefined;

    if (!medication || !dosage || !frequency) {
      return res.status(400).json({
        message: "Each medication needs a name, dosage, and frequency.",
      });
    }

    cleanItems.push({
      medication,
      dosage,
      frequency,
      duration,
      quantity: item.quantity,
      instructions,
    });
  }

  if (
    valid_until &&
    !/^\d{4}-\d{2}-\d{2}$/.test(valid_until)
  ) {
    return res.status(400).json({
      message: "valid_until must be YYYY-MM-DD.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: consultation } = await client.query(
      `SELECT patient_id, doctor_id
       FROM consultation_records
       WHERE consultation_record_id = $1`,
      [consultation_record_id],
    );

    if (consultation.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Consultation record not found.",
      });
    }

    if (consultation[0].doctor_id !== user_id) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "You can only prescribe for your own consultations.",
      });
    }

    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext('prescription_ids'))",
    );

    const prescription_id = await generatePrescriptionId();

    const { rows } = await client.query(
      `INSERT INTO prescription_records (
        prescription_id,
        consultation_record_id,
        patient_id,
        prescriber_id,
        valid_until,
        prescription_items,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
      RETURNING *`,
      [
        prescription_id,
        consultation_record_id,
        consultation[0].patient_id,
        user_id,
        valid_until,
        JSON.stringify(cleanItems),
        notes,
      ],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Prescription added successfully.",
      prescription: rows[0],
    } as addPrescriptions.response);
  } catch (error) {
    await client.query("ROLLBACK").catch(console.error);
    console.error("Error adding prescription:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return res.status(400).json({
        message: "Invalid consultation, patient, or user.",
      });
    }

    return res.status(500).json({
      message: "Internal server error.",
    });
  } finally {
    client.release();
  }
}

export async function addConsultationFindings(
  req: Request<
    object,
    addConsultationFindings.response | addConsultationFindings.error,
    addConsultationFindings.body
  >,
  res: Response<
    addConsultationFindings.response | addConsultationFindings.error
  >,
) {
  const patient_id =
    typeof req.body.patient_id === "string"
      ? req.body.patient_id.trim()
      : "";

  if (!patient_id) {
    return res.status(400).json({
      message: "Validation failed.",
      errors: {
        patient_id: "Patient is required.",
      },
    });
  }

  const validation = validateFindings(req.body);

  if (!validation.ok) {
    return res.status(400).json({
      message: "Validation failed.",
      errors: validation.errors,
    });
  }

  const doctor_id = resolveDoctorId(req);

  if (!doctor_id) {
    return res.status(401).json({
      message: "Doctor could not be identified.",
    });
  }

  const consultation_type =
    typeof req.body.consultation_type === "string" &&
    req.body.consultation_type.trim()
      ? req.body.consultation_type.trim().slice(0, 255)
      : "Initial";

  try {
    let service_id =
      typeof req.body.service_id === "string"
        ? req.body.service_id.trim()
        : "";

    if (service_id) {
      const service = await sql`
        SELECT service_type
        FROM services
        WHERE service_id = ${service_id}
      `;

      if (service.length === 0) {
        return res.status(400).json({
          message: "Invalid service ID.",
        });
      }

      if (
        !String(service[0].service_type)
          .toLowerCase()
          .startsWith("consultation")
      ) {
        return res.status(400).json({
          message: "Service is not a consultation service.",
        });
      }
    } else {
      const fallback = await sql`
        SELECT service_id
        FROM services
        WHERE active = TRUE
          AND LOWER(service_type) LIKE 'consultation%'
        ORDER BY id ASC
        LIMIT 1
      `;

      if (fallback.length === 0) {
        return res.status(400).json({
          message:
            "No active Consultation service exists. Ask an admin to add one under Service Pricing (service type: Consultation).",
          errors: {
            service_id: "No active consultation service is available.",
          },
        });
      }

      service_id = String(fallback[0].service_id);
    }

    const patient = await sql`
      SELECT 1
      FROM patients
      WHERE patient_id = ${patient_id}
    `;

    if (patient.length === 0) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    const {
      presenting_complaint,
      diagnosis,
      physical_examination,
    } = validation.value;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext('consultation_ids'))",
      );

      const consultation_record_id =
        await generateConsultationRecordID(client);

      const { rows } = await client.query(
        `INSERT INTO consultation_records (
          consultation_record_id,
          patient_id,
          doctor_id,
          service_id,
          consultation_type,
          diagnosis,
          presenting_complaint,
          physical_examination
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb)
        RETURNING *`,
        [
          consultation_record_id,
          patient_id,
          doctor_id,
          service_id,
          consultation_type,
          JSON.stringify(diagnosis),
          JSON.stringify(presenting_complaint),
          JSON.stringify(physical_examination),
        ],
      );

      await client.query("COMMIT");

      return res.status(201).json({
        message: "Consultation findings saved successfully.",
        consultation: rows[0],
      } as addConsultationFindings.response);
    } catch (error) {
      await client.query("ROLLBACK").catch(console.error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error saving consultation findings:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return res.status(400).json({
        message: "Invalid patient, doctor or service ID.",
      });
    }

    return res.status(500).json({
      message: "Failed to save consultation findings.",
    });
  }
}
