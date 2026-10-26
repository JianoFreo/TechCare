import { Request, Response } from "express";
import { sql } from "../../config/db.js";

export async function test(req: Request, res: Response) {
  res.status(200).json({ message: "Test route is working for SSE!" });
}

export async function getMessagesSSE(req: Request, res: Response) {
  try {
    const messages = await sql`
    SELECT * FROM sse_test
  `;

    // Tells the client that the response is an SSE stream,
    // allowing it to receive messages continuously instead of a regular JSON response.
    res.setHeader("Content-Type", "text/event-stream");

    // Prevents caches from storing the response,
    // so the client receives fresh stream data instead of a cached response.
    res.setHeader("Cache-Control", "no-cache");

    // Tells the connection to remain open,
    // allowing the server to send multiple events over the same HTTP connection.
    res.setHeader("Connection", "keep-alive");

    res.write(`data: ${JSON.stringify({ messages })}\n\n`);
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
}

export async function writeMessageSSE(req: Request, res: Response) {
  try {
    const { message } = req.body;
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
}
