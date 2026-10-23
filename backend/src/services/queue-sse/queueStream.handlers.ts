import type { Request, Response } from "express";
import { openQueueStream } from "./queueStream.hub.js";

// These are the Express handlers for the SSE routes (see admin.route.ts).
// They are written like our controllers, but they live in this folder so ALL
// the SSE code is in one place.

// GET /api/admin/queue/stream
// Called by the Queue Monitor page (admin). Unlike our other GET handlers,
// this one does NOT send one JSON response and finish. It keeps the connection
// open, and the backend sends a "queue-changed" message through it whenever
// the queue changes (see queueStream.hub.ts).
//
// NOTE: this route does not send the queue itself. The page loads the queue
// from GET /api/admin/queues.
export async function streamQueue(req: Request, res: Response) {
  // 1. open the live connection (returns null if too many screens are connected)
  const screen = openQueueStream(req, res);

  if (!screen) {
    return res.status(503).json({
      message: "Too many Queue Monitors are connected.",
    });
  }

  // 2. we do NOT call res.json() / res.end() here on purpose.
  // The connection stays open until the browser closes it.
}
