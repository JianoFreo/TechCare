import { sql } from "../../config/db.js";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";

export async function updateUser(req: Request, res: Response) { //patch /api/admin/users/:user_id
  try {
    const { user_id } = req.params;
    const { username, password, role, full_name, email, contact_number } =
      req.body;

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await sql`
      UPDATE users
      SET
        username = COALESCE(${username}, username),
        password = COALESCE(${hashedPassword}, password),
        role = COALESCE(${role}, role),
        full_name = COALESCE(${full_name}, full_name),
        email = COALESCE(${email}, email),
        contact_number = COALESCE(${contact_number}, contact_number)
      WHERE user_id = ${user_id}
      RETURNING *;
    `;

    res.status(200).json({
      message: "User updated successfully!",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
