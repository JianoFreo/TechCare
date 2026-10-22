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

// // 1. Tell the browser this is an SSE connection.
// res.setHeader("Content-Type", "text/event-stream");

// // 2. Keep the HTTP connection open.
// res.flushHeaders();

// // 3. Send an event whenever something changes.
// res.write("event: queue-updated\ndata: {}\n\n");


//// ------------- REST API example payload and fetching---------------------
// json payload
// app.get("/api/queue", (req, res) => {
//   res.json([
//     { queue_number: "LAB-001", status: "waiting" },
//     { queue_number: "LAB-002", status: "serving" }
//   ]);
// });
// THE response looks like this
// [
//   { "queue_number": "LAB-001", "status": "waiting" },
//   { "queue_number": "LAB-002", "status": "serving" }
// ]
// CLIENT ACCESING THE JSON API
// const response = await fetch("/api/queue");
// const data = await response.json();

// console.log(data);
// console.log(data[0].queue_number); // LAB-001
// console.log(data[0].status);       // waiting

///// ---------------- SSE example payload and fetching ---------------------

// SSE (Server-Sent Events) payload
// app.get("/events", (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");

//   res.write("event: queue-updated\n");
//   res.write("data: {}\n\n");
// });
// event: queue-updated
// data: {}

// CLIENT ACCESING THE SSE STREAM
// const source = new EventSource("/api/queue/stream");

// source.addEventListener("queue-updated", (event) => {
//   const data = JSON.parse(event.data);

//   console.log(data.queue_number); // LAB-001
//   console.log(data.status);       // waiting
// });