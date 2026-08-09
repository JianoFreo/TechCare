import { sql } from "../../config/db.js";
import { json, Request, Response } from "express";

export async function updateLabRequestStatus(req: Request, res: Response) {
  try {
    const { request_id } = req.params;
    const { status,results } = req.body;

    if (!request_id) {
      return res.status(400).json({
        message: "Request ID are required!",
      });
    }

     if (!status) {
      return res.status(400).json({
        message: "Status is required!",
      });
    }


    const updatedLabRequestStatus = await sql`
        UPDATE lab_requests
        SET 
          status = ${status},
          results = ${results ? JSON.stringify(results) : null},
          updates_at = NOW()
        WHERE request_id = ${request_id} AND
              is_paid = TRUE
        RETURNING 
        request_id,
        consultation_id,
        patient_id,
        doctor_id,
        test_type,
        results,
        status,
        requested_at,
        updated_at;
    `;

    if (updatedLabRequestStatus.length === 0) {
      return res.status(400).json({
        message: "Laboratory request doesn't exist.",
      });
    }

    return res.status(200).json({
      message: `Laboratory request status changed to ${status}.`,
      request: updatedLabRequestStatus[0],
    });
  } catch (error) {
    console.error("Unable to update laboratory request", error);


    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function updateQueueStatus(req: Request, res: Response) {
  try {
    const { queue_id } = req.params;

    if (!queue_id) {
      return res.status(400).json({
        message: "Queue ID is required!",
      });
    }
    const updatedQueueStatus = await sql`
      UPDATE queue_entries
      SET status = 'serving'
      WHERE queue_id = ${queue_id}
      RETURNING *;
    `;

    if (updatedQueueStatus.length === 0) {
      return res.status(400).json({
        message: "Queue entry doesn't exist.",
      });
    }

    return res.status(200).json({
      message: "Queue entry status changed to serving.",
      request: updatedQueueStatus,
    });
  } catch (error) {
    console.error("Unable to update queue status", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
