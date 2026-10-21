import { sql } from "../config/db.js";

/**
 * What the monitor is allowed to see. This is deliberately a SMALL, MASKED
 * shape: everything in an SSE payload is visible in the browser's devtools,
 * so we never send birthdate, patient_id, or a full name to a display screen.
 */
export type MonitorEntry = {
  queue_id: string;
  queue_number: number;
  service_name: string;
  service_type: "consultation" | "laboratory" | string;
  room: string | null;
  is_priority: boolean;
  status: "waiting" | "serving" | "skipped" | "completed" | "cancelled" | string;
  display_name: string; // "Juan D."
  updated_at: string;
};

/** Today's queue, normalized. Same "today" window as GET /fdstaff/queues. */
export async function fetchQueueSnapshot(): Promise<MonitorEntry[]> {
  const rows = await sql`
    SELECT
      qe.queue_id,
      qe.queue_number,
      s.service_name,
      LOWER(s.service_type)                                  AS service_type,
      s.room,
      qe.is_priority,
      LOWER(qe.status)                                       AS status,  -- 'Waiting' vs 'waiting' exist in the codebase
      CONCAT(p.first_name, ' ', LEFT(p.last_name, 1), '.')   AS display_name,
      qe.updated_at
    FROM queue_entries qe
    JOIN patients p ON p.patient_id = qe.patient_id
    JOIN services s ON s.service_id = qe.service_id
    WHERE qe.created_at >= CURRENT_DATE
      AND qe.created_at <  CURRENT_DATE + INTERVAL '1 day'
    ORDER BY qe.queue_number ASC, qe.id ASC
  `;
  return rows as unknown as MonitorEntry[];
}