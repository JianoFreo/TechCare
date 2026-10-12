import { sql } from "../../config/db.js";
import { json, Request, Response } from "express";

export async function updateQueueStatus(req: Request, res: Response) {
  try {
    const { queue_id } = req.params;
    const { room } = req.body as { room?: string };

    if (!queue_id) {
      return res.status(400).json({ message: "Queue ID is required!" });
    }
    if (!room) {
      return res.status(400).json({ message: "room is required" });
    }

    const [updated] = await sql`
      UPDATE queue_entries q
      SET
        status = CASE
          WHEN LOWER(q.status) IN ('waiting', 'skipped') THEN 'Serving'
          WHEN LOWER(q.status) = 'serving' THEN 'Completed'
        END,
        updated_at = NOW()
      FROM services s
      WHERE q.queue_id = ${queue_id}
        AND q.queue_id LIKE 'LAB-%'
        AND s.service_id = q.service_id
        AND s.room = ${room}
        AND LOWER(q.status) IN ('waiting', 'skipped', 'serving')
      RETURNING q.*
    `;

    if (!updated) {
      // Work out why, so the client gets an accurate status code
      const [existing] = await sql`
        SELECT q.status, s.room
        FROM queue_entries q
        JOIN services s ON s.service_id = q.service_id
        WHERE q.queue_id = ${queue_id}
          AND q.queue_id LIKE 'LAB-%'
      `;

      if (!existing) {
        return res.status(404).json({ message: "Queue entry not found." });
      }
      if (existing.room !== room) {
        return res
          .status(403)
          .json({ message: "This queue belongs to a different room." });
      }
      return res.status(409).json({
        message: `Queue is already ${existing.status} and can't be updated.`,
      });
    }

    return res.status(200).json({
      message: `Queue entry status changed to ${updated.status}.`,
      queue: updated,
    });
  } catch (error) {
    console.error("Unable to update queue status", error);
    return res.status(500).json({ message: "Internal Server Error" });
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
