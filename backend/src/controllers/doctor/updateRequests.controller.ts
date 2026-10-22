import type { Request, Response } from "express";
import { pool } from "../../config/db.js";
import { resolveDoctorId } from "../../utils/resolveDoctorId.js";
import type { consultationQueueAction } from "./dto/update.dto.js";

type ActionResponse = Response<consultationQueueAction.response | consultationQueueAction.error>;

export function acceptConsultationQueue(req: Request, res: ActionResponse) {
  return updateConsultationQueue(req, res, "Serving");
}

export function cancelConsultationQueue(req: Request, res: ActionResponse) {
  return updateConsultationQueue(req, res, "Cancelled");
}

async function updateConsultationQueue(
  req: Request,
  res: ActionResponse,
  nextStatus: "Serving" | "Cancelled",
) {
  const queueId = req.params.queue_id;
  if (typeof queueId !== "string" || !queueId.trim() || queueId.length > 255) {
    return res.status(400).json({ message: "A valid queue ID is required." });
  }

  const doctorId = resolveDoctorId(req);
  if (!doctorId) {
    return res.status(401).json({ message: "Doctor could not be identified." });
  }

  const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
  if (nextStatus === "Cancelled" && (!reason || reason.length > 255)) {
    return res.status(400).json({
      message: "Cancellation reason is required and must not exceed 255 characters.",
    });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows: doctors } = await client.query(
        `SELECT user_id FROM users
         WHERE user_id = $1 AND role = 'doctor' AND account_status = TRUE`,
        [doctorId],
      );
      if (!doctors.length) {
        await client.query("ROLLBACK");
        return res.status(403).json({ message: "An active doctor account is required." });
      }

      // Lock both rows so accepting and cancelling the same visit cannot race.
      const { rows } = await client.query(
        `SELECT q.*, cr.consultation_record_id, cr.doctor_id,
                cr.status AS consultation_status
         FROM queue_entries q
         JOIN services s ON s.service_id = q.service_id
         JOIN consultation_records cr ON cr.queue_id = q.queue_id
           AND cr.patient_id = q.patient_id AND cr.service_id = q.service_id
         WHERE q.queue_id = $1 AND q.queue_id LIKE 'CONS-%'
           AND LOWER(s.service_type) LIKE 'consultation%'
         FOR UPDATE OF q, cr`,
        [queueId.trim()],
      );
      if (!rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Consultation queue entry not found." });
      }
      if (rows.length !== 1) {
        await client.query("ROLLBACK");
        return res.status(409).json({ message: "Queue entry must have exactly one consultation record." });
      }

      const entry = rows[0];
      if (entry.doctor_id !== doctorId) {
        await client.query("ROLLBACK");
        return res.status(403).json({ message: "This consultation is assigned to another doctor." });
      }
      const allowed = nextStatus === "Serving"
        ? ["waiting", "skipped"]
        : ["waiting", "skipped", "serving"];
      if (!allowed.includes(String(entry.status).toLowerCase()) ||
          !allowed.includes(String(entry.consultation_status).toLowerCase())) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: `Consultation cannot be ${nextStatus === "Serving" ? "accepted" : "cancelled"} in its current state.`,
        });
      }

      const { rows: queues } = await client.query(
        `UPDATE queue_entries SET status = $1, updated_at = NOW()
         WHERE queue_id = $2 RETURNING *`,
        [nextStatus, queueId.trim()],
      );
      const { rows: consultations } = await client.query(
        `UPDATE consultation_records
         SET status = $1, cancellation_reason = $2
         WHERE consultation_record_id = $3 RETURNING *`,
        [nextStatus, nextStatus === "Cancelled" ? reason : null, entry.consultation_record_id],
      );
      await client.query("COMMIT");
      return res.status(200).json({
        message: nextStatus === "Serving"
          ? "Consultation accepted and now being served."
          : "Consultation request cancelled successfully.",
        queue: queues[0],
        consultation: consultations[0],
      });
    } catch (error) {
      await client.query("ROLLBACK").catch(console.error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Unable to update consultation queue:", error);
    return res.status(500).json({ message: "Unable to update consultation queue." });
  }
}
