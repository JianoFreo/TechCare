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
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    res.status(200).json(validUser[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}





export async function signUp(req: Request, res: Response) {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ message: "Username, password, and role are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // const signUpResult = await sql`
    //     INSERT INTO pending_users (username, password, role) 
    //     VALUES (${username}, ${hashedPassword}, ${role}) 
    //     RETURNING *
    // `;
    const existingUser = await sql`
        SELECT * FROM users
        WHERE username = ${username}
    `;
    if (existingUser.length > 0) {
      return res.status(200).json({ message: "Username already exists" });
    }
    const signUpResult = await sql`
        INSERT INTO users (username, password, role) 
        VALUES (${username}, ${hashedPassword}, ${role}) 
        RETURNING *
    `;
    const token = jwt.sign({ id: signUpResult[0].id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    
    res.status(201).json({ user: signUpResult[0], message: "Sign up successful!", token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
