import type { Request, Response } from "express";
import { addClient } from "./utils/utils.js";
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
    addClient(res)
  } catch (error) {}
}
