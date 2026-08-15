import { sql } from "../../config/db.js";
import bcrypt from "bcryptjs";
import { json, Request, Response } from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { ENV } from "../../config/env.js";

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
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(200).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ user_id: user.user_id }, ENV.JWT_SECRET, {
      expiresIn: "5min",
    }); // it goingg to make a token out of user id
    // this has to be an object because jwt.sign expects an object as the first argument, not a string. So we wrap user.user_id in an object with a key of user_id.
    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      ENV.JWT_REFRESH_TOKEN,
      { expiresIn: "1d" },
    ); // it goingg to make a token out of user id

    res
      .status(200)
      .json({ message: "Login successful", user, token, refreshToken });
    //   {
    //   "message": "Login successful",
    //   "user": {
    //     "user_id": 5,
    //     "username": "jiano",
    //     "full_name": "Jiano",
    //     "email": "jiano@example.com",
    //     "contact_number": "09123456789",
    //     "role": "admin"
    //   },
    //   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
