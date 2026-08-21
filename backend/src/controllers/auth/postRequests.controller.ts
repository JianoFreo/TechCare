import { sql } from "../../config/db.js";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // =========================
    // REQUIRED CREDENTIALS
    // =========================
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    // =========================
    // FIND USER
    // =========================
    const validUser = await sql`
      SELECT *
      FROM users
      WHERE username = ${username}
    `;

    const user = validUser[0];

    if (!user) {
      return res.status(200).json({
        message: "Invalid username",
      });
    }

    // =========================
    // VERIFY PASSWORD
    // =========================
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(200).json({
        message: "Invalid password",
      });
    }

    // =========================
    // GENERATE ACCESS TOKEN
    // =========================
    // Creates a short-lived JWT containing the authenticated user's ID.
    // The token is used to authenticate requests to protected endpoints.
    const token = jwt.sign(
      {
        user_id: user.user_id,
      },
      ENV.JWT_SECRET,
      {
        expiresIn: "5min",
      }
    );

    // =========================
    // GENERATE REFRESH TOKEN
    // =========================
    // Creates a longer-lived JWT containing the authenticated user's ID.
    // The refresh token can be used to obtain a new access token
    // after the access token expires.
    const refreshToken = jwt.sign(
      {
        user_id: user.user_id,
      },
      ENV.JWT_REFRESH_TOKEN,
      {
        expiresIn: "1d",
      }
    );

    // =========================
    // REMOVE SENSITIVE DATA
    // =========================
    // Prevents the password hash from being sent to the client.
    const { password_hash, ...safeUser } = user;

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      message: "Login successful",
      user: safeUser,
      token,
      refreshToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}