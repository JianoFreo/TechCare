import { Request, Response } from "express";
import { sql } from "../config/db.js";

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
        AND password = ${password} 
    `;
    const user = validUser[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    else {
      res.json(user.role);
    }

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}





export async function signUp(req: Request, res: Response) {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name || !role) {
      return res
        .status(400)
        .json({ message: "Username, password, name, and role   are required" });
    }
    const signUpResult = await sql`
        INSERT INTO users (username, password, role) 
        VALUES (${username}, ${password}, ${role}) 
        RETURNING *
    `;
    
    res.json({ data: signUpResult[0], message: "Sign up successful!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
