import { sql } from "../config/db.js";
import { Request, Response } from "express";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const totalUsers = await sql`SELECT * FROM users`;
    res.json(totalUsers);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export function addNewUser(req: Request, res: Response) {
  try {
    const { email, role, password, name } = req.body;
    if (!email || !password || !name || !role) {
      return res
        .status(400)
        .json({ message: "Email, role, password, and name are required" });
    }
    res.json({ message: "New user added successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export function viewAllUsers(req: Request, res: Response) {
  try {
    res.json({ message: "List of all users" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export function deleteUser(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    res.json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export function updateUser(req: Request, res: Response) {
  try {
    const { email, role, password, name } = req.body;
    if (!email || !password || !name || !role) {
      return res
        .status(400)
        .json({ message: "Email, role, password, and name are required" });
    }
    res.json({ message: "User updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
