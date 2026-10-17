import { sql } from "../../config/db.js";
import { json, Request, Response } from "express";

export async function acceptQueueEntry(req: Request, res: Response) {
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
        status = 'Serving',
        updated_at = NOW()
      FROM services s
      WHERE q.queue_id = ${queue_id}
        AND q.queue_id LIKE 'LAB-%'
        AND s.service_id = q.service_id
        AND s.room = ${room}
        AND LOWER(q.status) IN ('waiting', 'skipped')
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
        message: `Queue is ${existing.status} and can't be accepted.`,
      });
    }

    return res.status(200).json({
      message: "Queue entry accepted and now being served.",
      queue: updated,
    });
  } catch (error) {
    console.error("Unable to accept queue", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function completeQueueEntry(req: Request, res: Response) {
  try {
    const { queue_id } = req.params;
    const { room } = (req.body ?? {}) as { room?: string };

    if (!queue_id) {
      return res.status(400).json({ message: "Queue ID is required!" });
    }
    if (typeof room !== "string" || !room.trim()) {
      return res.status(400).json({ message: "room is required" });
    }

    const [updated] = await sql`
      WITH completed_queue AS (
        UPDATE queue_entries q
        SET
          status = 'Completed',
          updated_at = CASE
            WHEN LOWER(q.status) = 'completed' THEN q.updated_at
            ELSE NOW()
          END
        FROM services s
        WHERE q.queue_id = ${queue_id}
          AND q.queue_id LIKE 'LAB-%'
          AND s.service_id = q.service_id
          AND s.room = ${room}
          AND LOWER(q.status) IN ('serving', 'completed')
          AND (
            LOWER(q.status) = 'completed'
            OR EXISTS (
              SELECT 1
              FROM laboratory_request_items ri
              JOIN services item_service ON item_service.service_id = ri.service_id
              WHERE ri.queue_id = q.queue_id
                AND item_service.room = ${room}
                AND LOWER(ri.status) IN (
                  'requested', 'waiting', 'serving', 'specimen collected'
                )
            )
          )
        RETURNING q.*
      ), collected_items AS (
        UPDATE laboratory_request_items ri
        SET status = 'Specimen Collected', updated_at = NOW()
        FROM completed_queue cq, services s
        WHERE ri.queue_id = cq.queue_id
          AND s.service_id = ri.service_id
          AND s.room = ${room}
          AND LOWER(ri.status) IN ('requested', 'waiting', 'serving')
        RETURNING ri.lab_item_id
      )
      SELECT cq.*, (SELECT COUNT(*)::int FROM collected_items) AS collected_item_count
      FROM completed_queue cq
      UPDATE queue_entries q
      SET
        status = 'Collected',
        updated_at = NOW()
      FROM services s
      WHERE q.queue_id = ${queue_id}
        AND q.queue_id LIKE 'LAB-%'
        AND s.service_id = q.service_id
        AND s.room = ${room}
        AND LOWER(q.status) IN ('serving')
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
      if (String(existing.status).toLowerCase() === "serving") {
        return res.status(409).json({
          message:
            "No laboratory request items are available for specimen collection in this room.",
        });
      }
      return res.status(409).json({
        message: "Queue is " + existing.status + " and can't be completed.",
      });
    }

    const { collected_item_count, ...queue } = updated;
    return res.status(200).json({
      message: "Queue entry completed.",
      queue,
      collected_item_count,
    });
  } catch (error) {
    console.error("Unable to complete queue", error);
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

    const { queue_number: currentQueueNumber, service_id, status } = queue[0];

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
        queue_number = ${currentQueueNumber + 2},
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
    const { queue_id } = req.params;
    const { reason } = req.body as { reason?: string };

    if (!queue_id) {
      return res.status(400).json({
        message: "Queue ID is required!",
      });
    }

    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({
        message: "Cancellation reason is required!",
      });
    }

    const cancellationReason = reason.trim();

    if (cancellationReason.length > 255) {
      return res.status(400).json({
        message: "Cancellation reason must not exceed 255 characters.",
      });
    }

    // Find the queue entry.
    const queue = await sql`
      SELECT queue_id, queue_number, service_id, status
      FROM queue_entries
      WHERE queue_id = ${queue_id}
      LIMIT 1;
    `;

    if (queue.length === 0) {
      return res.status(404).json({
        message: "Queue entry not found.",
      });
    }

    const { status } = queue[0];

    // Only waiting, skipped, or serving entries can be cancelled.
    if (
      !["waiting", "skipped", "serving"].includes(String(status).toLowerCase())
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

    if (updatedQueue.length === 0) {
      return res.status(409).json({
        message: "Queue entry status changed. Please try again.",
      });
    }

    // Store the cancellation reason against the associated
    // laboratory request item.
    const updatedItems = await sql`
      UPDATE laboratory_request_items
      SET
        reason = ${cancellationReason},
        updated_at = NOW()
      WHERE queue_id = ${queue_id}
      RETURNING lab_item_id, request_id, queue_id, reason;
    `;

    return res.status(200).json({
      message: "Queue cancelled successfully.",
      queue: updatedQueue[0],
      reason: cancellationReason,
      laboratory_items: updatedItems,
    });
  } catch (error) {
    console.error("Error in cancelQueueEntry controller:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}


export async function startLaboratoryAnalysis(req: Request, res: Response) {
  const { room, lab_item_ids } = req.body ?? {};
  if (
    typeof room !== "string" ||
    !room.trim() ||
    !Array.isArray(lab_item_ids) ||
    !lab_item_ids.length ||
    lab_item_ids.length > 100 ||
    lab_item_ids.some((id) => typeof id !== "string" || !id.trim()) ||
    new Set(lab_item_ids).size !== lab_item_ids.length
  ) {
    return res
      .status(400)
      .json({
        message: "A room and distinct laboratory item IDs are required.",
      });
  }
  try {
    const items = await sql`
      WITH eligible AS MATERIALIZED (
        SELECT ri.lab_item_id FROM laboratory_request_items ri
        JOIN services s ON s.service_id = ri.service_id
        WHERE ri.lab_item_id = ANY(${lab_item_ids}::text[]) AND s.room = ${room}
          AND ri.status IN ('Specimen Collected', 'In Progress')
          AND NOT EXISTS (SELECT 1 FROM laboratory_results r WHERE r.lab_item_id = ri.lab_item_id)
        FOR UPDATE OF ri
      )
      UPDATE laboratory_request_items ri SET status = 'In Progress',
        updated_at = CASE WHEN ri.status = 'In Progress' THEN ri.updated_at ELSE NOW() END
      WHERE ri.lab_item_id IN (SELECT lab_item_id FROM eligible)
        AND (SELECT count(*) FROM eligible) = ${lab_item_ids.length}
      RETURNING ri.lab_item_id, ri.status
    `;
    if (items.length !== lab_item_ids.length)
      return res
        .status(409)
        .json({
          message:
            "Some tests are already completed or are not collected samples in this room. Refresh the list.",
        });
    return res.json({ items });
  } catch (error) {
    console.error("Unable to start analysis:", error);
    return res.status(500).json({ message: "Unable to start analysis." });
  }
}

export async function releaseLaboratoryResult(req: Request, res: Response) {
  try {
    const { result_id } = req.params;

    if (!result_id) {
      return res.status(400).json({
        message: "Result ID is required.",
      });
    }

    const [result] = await sql`
      UPDATE laboratory_results
      SET
        status = 'Released',
        updated_at = NOW()
      WHERE result_id = ${result_id}
        AND status = 'Pending'
      RETURNING result_id, lab_item_id, status, updated_at;
    `;

    if (!result) {
      const [existing] = await sql`
        SELECT result_id, status
        FROM laboratory_results
        WHERE result_id = ${result_id}
        LIMIT 1;
      `;

      if (!existing) {
        return res.status(404).json({
          message: "Laboratory result not found.",
        });
      }

      return res.status(409).json({
        message: `Result cannot be released because its status is ${existing.status}.`,
      });
    }

    return res.status(200).json({
      message: "Laboratory result released successfully.",
      result,
    });
  } catch (error) {
    console.error("Unable to release laboratory result:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
