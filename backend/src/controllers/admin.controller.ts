import { Request, Response } from 'express';

export function getAdminDashboard(req: Request, res: Response) {
  res.json({ message: 'Welcome to the Admin Dashboard!' });
}