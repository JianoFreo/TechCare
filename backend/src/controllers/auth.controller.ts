import { json, Request, Response } from "express";
import { sql } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }
    const validUser = await sql`
        SELECT * FROM users 
        WHERE username = ${username} 
    `;
    const user = validUser[0];
    if (!user) {
      return res.status(200).json({ message: "Invalid username" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}


