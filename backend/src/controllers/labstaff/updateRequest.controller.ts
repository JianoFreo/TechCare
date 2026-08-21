import { sql } from "../../config/db.js";
import { json, Request, Response } from "express";

export async function updateLabRequestStatus(req: Request, res: Response) {
  try {
    const { request_id } = req.params;
    const { status, results } = req.body;

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
        RETURNING *
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
      SET 
        status = CASE
          WHEN status = 'Waiting' THEN 'Serving'
          WHEN status = 'Skipped' THEN 'Serving'
          WHEN status = 'Serving' THEN 'Completed'
        END,
        updated_at = NOW()
      WHERE queue_id = ${queue_id}
        AND status IN ('Waiting', 'Skipped', 'Serving')
      RETURNING *;
    `;

    if (updatedQueueStatus.length === 0) {
      return res.status(400).json({
        message: "Queue entry doesn't exist or cannot be updated anymore.",
      });
    }

    return res.status(200).json({
      message: `Queue entry status changed to ${updatedQueueStatus[0].status}.`,
      request: updatedQueueStatus,
    });
  } catch (error) {
    console.error("Unable to update queue status", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function skipQueueEntry(req: Request, res: Response) {
  try {
    // Get the queue_id of the patient who wants to skip.
    const { queue_id } = req.params;

    // Find the patient's current queue number and service type.
    // We need the service_type so we only touch the same queue,
    // and the queue_number so we know who is immediately behind them.
    const queue = await sql`
      SELECT queue_number, service_type
      FROM queue_entries
      WHERE queue_id = ${queue_id};
    `;

    // Stop if the queue entry doesn't exist.
    if (queue.length === 0) {
      return res.status(404).json({
        message: "Queue entry not found.",
      });
    }

    const { queue_number: currentQueueNumber, service_type } = queue[0];

    // Move the patient behind forward by one position.
    //
    // Example:
    // Charlie = #3
    // David = #4
    //
    // David becomes #3.
    //
    // Scoped to the same service_type and status = 'waiting' so this
    // doesn't accidentally shift patients in other queues (e.g. Lab)
    // or already-served/cancelled entries that happen to share the
    // same queue_number.
    await sql`
      UPDATE queue_entries
      SET queue_number = queue_number - 1
      WHERE
        queue_number = ${currentQueueNumber + 1}
        AND service_type = ${service_type}
        AND status = 'waiting';
    `;

    // Move the skipped patient back by one position.
    //
    // Charlie becomes #4.
    const updatedQueue = await sql`
      UPDATE queue_entries
      SET queue_number = ${currentQueueNumber + 1}
      WHERE queue_id = ${queue_id}
      RETURNING *;
    `;

    return res.status(200).json({
      message: "Queue skipped successfully.",
      queue: updatedQueue[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error in skipQueueEntry controller.",
    });
  }
}
