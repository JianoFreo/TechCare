import { sql } from "../../config/db.js";
import type { Request, Response } from "express";
import type { deleteQueue, deletePatient } from "./dto/delete.dto.js";
import { publishQueueChange } from "../../services/queueStream.js";

export async function deleteQueue(
  req: Request,
  res: Response<deleteQueue.response | deleteQueue.error>,
) {
  try {
    const { queue_id } = req.params;

    // Delete the queue entry.
    // RETURNING returns the deleted row so we can verify it existed.
    const deletedQueue = await sql`
      DELETE FROM queue_entries
      WHERE queue_id = ${queue_id}
      RETURNING queue_id;
    `;

    // If nothing was returned, no queue with that ID existed.
    if (deletedQueue.length === 0) {
      return res.status(404).json({
        error: "Queue not found",
      } as deleteQueue.error);
    }

    publishQueueChange();
    return res.status(200).json({
      message: "Queue deleted successfully",
    } as deleteQueue.response);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error deleting queue",
    } as deleteQueue.error);
  }
}

export async function deletePatient(
  req: Request,
  res: Response<deletePatient.response | deletePatient.error>,
) {
  try {
    const { patient_id } = req.params;

    // Delete the patient record.
    // RETURNING returns the deleted row so we can verify it existed.
    const deletedPatient = await sql`
      DELETE FROM patients
      WHERE patient_id = ${patient_id}
      RETURNING patient_id;
    `;

    // If nothing was returned, no patient with that ID existed.
    if (deletedPatient.length === 0) {
      return res.status(404).json({
        message: "Patient not found",
        error: "Patient not found",
      } as deletePatient.error);
    }
    publishQueueChange();
    return res.status(200).json({
      message: "Patient deleted successfully",
    } as deletePatient.response);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error deleting patient",
      error: "Error deleting patient",
    } as deletePatient.error);
  }
}
