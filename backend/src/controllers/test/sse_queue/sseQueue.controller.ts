import type { Request, Response } from "express";
import { addClient } from "./utils/utils.js";
import { sql } from "../../../config/db.js";
export async function receiveQueueSSE(req: Request, res: Response) {
  try {
    const { message } = req.body;
    // Tell the browser that this response is an SSE stream,
    // not an ordinary JSON response.
    res.setHeader("Content-Type", "text/event-stream");

    // Tell caches not to store this response.
    // We want the client to receive live updates, not a cached response.
    res.setHeader("Cache-Control", "no-cache");

    // Ask the connection to remain open so we can send
    // multiple SSE events through the same HTTP connection.
    res.setHeader("Connection", "keep-alive");

    // Send the response headers immediately instead of waiting
    // for the first piece of data to be written.
    res.flushHeaders();
    addClient(res);
    const messages = await sql`
        SELECT * FROM sse_test
    `;

    res.write(`data: ${JSON.stringify({ messages })}`);
  } catch (error) {
    // Print the actual error in the backend terminal for debugging.
    console.error(error);

    // If headers have not been sent, we can still send a normal
    // HTTP 500 error response.
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal Server error",
      });
    } else {
      // If the SSE response has already started,
      // close the connection instead of trying to send JSON
      // as if this were a normal response.
      res.end();
    }
  }
}
