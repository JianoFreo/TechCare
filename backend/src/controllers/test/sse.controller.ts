import { Request, Response } from "express";

export function test(req: Request, res: Response) {
  res.status(200).json({ message: "Test route is working for SSE!" });
}


export function streamSSE(req: Request, res: Response) { 

  res.setHeader("Content-Type", "text/event-stream");
  res.write("data: " + "hello\n\n"); // Send a test message to the client
}