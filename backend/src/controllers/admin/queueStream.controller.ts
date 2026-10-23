import type { Request, Response } from "express";
import {
  getConnectedScreens,
  openQueueStream,
  sendQueueSnapshot,
} from "../../utils/queueStream.js";

// GET /api/admin/queue/stream
// Called by the Queue Monitor page (admin). Unlike our other GET controllers,
// this one does NOT send one JSON response and finish. It keeps the connection
// open, and the backend pushes updates through it (see utils/queueStream.ts).
export async function streamQueue(req: Request, res: Response) {
  // 1. open the live connection (returns null if too many screens are connected)
  const screen = openQueueStream(req, res);

  if (!screen) {
    return res.status(503).json({
      message: "Too many Queue Monitors are connected.",
    });
  }

  // 2. send today's queue right away so the screen isn't empty
  await sendQueueSnapshot(screen);

  // 3. we do NOT call res.json() / res.end() here on purpose.
  // The connection stays open until the browser closes it.
}

// GET /api/admin/queue/stream/stats
// Quick way to check how many Queue Monitors are connected right now.
export async function getQueueStreamStats(req: Request, res: Response) {
  const screens = getConnectedScreens();

  return res.status(200).json({
    connectedScreens: screens.length,
    screens,
  });
}