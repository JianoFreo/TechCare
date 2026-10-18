
import type { Request, Response } from "express";
import { sql } from "../../config/db.js";
import type { logout } from "./dto/update.dto.js";

export async function logout(
  req: Request,
  res: Response<logout.response | logout.error>,
) {
  try {
    const { user_id }  = req.user;

    // =========================
    // REQUIRED CREDENTIALS
    // =========================
    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
      } as logout.error);
    }

    await sql`
      UPDATE users
      SET active = FALSE
      WHERE user_id = ${user_id}
    `;

    return res.status(200).json({
      message: "Logout successful",
    } as logout.response);
  } catch (error) {
    console.error("Error logging out:", error);

    return res.status(500).json({
      message: "Internal server error",
    } as logout.error);
  }
}
