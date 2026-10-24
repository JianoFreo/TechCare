import { Request, Response } from "express";

export function test(req: Request, res: Response) {
  res.status(200).json({ message: "Test route is working for SSE!" });
}


export function streamSSE(req: Request, res: Response) { 

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.write("retry: 10000\n\n"); // Retry every 10 seconds if connection is lost
}