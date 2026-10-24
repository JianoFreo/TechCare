import { Request, Response } from "express";

export function test(req: Request, res: Response) {
  res.status(200).json({ message: "Test route is working!" });
}
