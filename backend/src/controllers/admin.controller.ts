import { Request, Response } from 'express';

export function getAdminDashboard(req: Request, res: Response) {
  try{
    res.json({ message: 'Welcome to the Admin Dashboard!' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}