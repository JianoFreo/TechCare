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

    // Validate the queue ID.
    if (!queue_id) {
      return res.status(400).json({
        message: "Queue ID is required!",
      });
    }

    // Find the patient's current queue entry.
    // We need the service_id and queue_number to identify
    // the correct queue and determine the patient's position.
    const queue = await sql`
      SELECT queue_id, queue_number, service_id, status
      FROM queue_entries
      WHERE queue_id = ${queue_id}
      LIMIT 1;
    `;

    // Stop if the queue entry doesn't exist.
    if (queue.length === 0) {
      return res.status(404).json({
        message: "Queue entry not found.",
      });
    }

    const {
      queue_number: currentQueueNumber,
      service_id,
      status,
    } = queue[0];

    // Only waiting or serving entries can be skipped.
    if (!["waiting", "serving"].includes(String(status).toLowerCase())) {
      return res.status(409).json({
        message: `Queue entry cannot be skipped because its status is ${status}.`,
      });
    }

    // Move the next waiting patient forward by one position.
    //
    // Example:
    // Charlie = #3 (skipped)
    // David = #4 (waiting)
    //
    // David becomes #3.
    //
    // Scoped to the same service_id and waiting status so this
    // doesn't shift patients from other services or completed queues.
    await sql`
      UPDATE queue_entries
      SET
        queue_number = queue_number - 1,
        updated_at = NOW()
      WHERE queue_number = ${currentQueueNumber + 1}
        AND service_id = ${service_id}
        AND LOWER(status) = 'waiting';
    `;

    // Move the skipped patient back one position and mark the entry
    // as skipped so it can be called again later.
    //
    // Charlie becomes #4 with status = 'skipped'.
    const updatedQueue = await sql`
      UPDATE queue_entries
      SET
        queue_number = ${currentQueueNumber + 1},
        status = 'skipped',
        updated_at = NOW()
      WHERE queue_id = ${queue_id}
      RETURNING *;
    `;

    return res.status(200).json({
      message: "Queue skipped successfully and returned to the queue.",
      queue: updatedQueue[0],
    });
  } catch (error) {
    console.error("Error in skipQueueEntry controller:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export async function cancelQueueEntry(req: Request, res: Response) {
  try {
    // Get the queue_id of the patient whose queue needs to be cancelled.
    const { queue_id } = req.params;

    // Validate the queue ID.
    if (!queue_id) {
      return res.status(400).json({
        message: "Queue ID is required!",
      });
    }

    // Find the patient's current queue entry.
    const queue = await sql`
      SELECT queue_id, queue_number, service_id, status
      FROM queue_entries
      WHERE queue_id = ${queue_id}
      LIMIT 1;
    `;

    // Stop if the queue entry doesn't exist.
    if (queue.length === 0) {
      return res.status(404).json({
        message: "Queue entry not found.",
      });
    }

    const { status } = queue[0];

    // Only waiting, skipped, or serving entries can be cancelled.
    if (
      !["waiting", "skipped", "serving"].includes(
        String(status).toLowerCase(),
      )
    ) {
      return res.status(409).json({
        message: `Queue entry cannot be cancelled because its status is ${status}.`,
      });
    }

    // Cancel the queue entry.
    const updatedQueue = await sql`
      UPDATE queue_entries
      SET
        status = 'Cancelled',
        updated_at = NOW()
      WHERE queue_id = ${queue_id}
        AND LOWER(status) IN ('waiting', 'skipped', 'serving')
      RETURNING *;
    `;

    // Handle cases where the status changed before the update.
    if (updatedQueue.length === 0) {
      return res.status(409).json({
        message: "Queue entry status changed. Please try again.",
      });
    }

    return res.status(200).json({
      message: "Queue cancelled successfully.",
      queue: updatedQueue[0],
    });
  } catch (error) {
    console.error("Error in cancelQueueEntry controller:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

