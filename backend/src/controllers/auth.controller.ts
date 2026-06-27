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

export async function signUp(req: Request, res: Response) {
  try {
    const { username, password, role, full_name, email, contact_number } = req.body;
    if (!username || !password || !role || !full_name || !email || !contact_number) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // const signUpResult = await sql`
    //     INSERT INTO pending_users (username, password, role)
    //     VALUES (${username}, ${hashedPassword}, ${role})
    //     RETURNING *
    // `;
    const existingUser = await sql`
        SELECT * FROM users
        WHERE username = ${username} OR email = ${email} OR contact_number = ${contact_number}  
    `;
    if (existingUser.length > 0) {
      return res.status(200).json({ message: "User already exists" });
    }
    const signUpResult = await sql`
        INSERT INTO users (username, password, role, full_name, email, contact_number) 
        VALUES (${username}, ${hashedPassword}, ${role}, ${full_name}, ${email}, ${contact_number}) 
        RETURNING *
    `;
    const token = jwt.sign(
      { id: signUpResult[0].id },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1h",
      },
    );

    res
      .status(201)
      .json({ user: signUpResult[0], message: "Sign up successful!", token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
