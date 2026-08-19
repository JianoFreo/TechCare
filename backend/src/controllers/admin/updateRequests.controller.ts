import { sql } from "../../config/db.js";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

export async function updateUser(req: Request, res: Response) {
  // PATCH /api/admin/users/:user_id
  try {
    const { user_id } = req.params;

    const {
      username,
      password,
      first_name,
      middle_name,
      last_name,
      suffix,
      sex,
      email,
      contact_number,
      emergency_contact_name,
      emergency_contact,
      address,
      birthdate,
      role,
      department,
      employment_status,
      account_status,
      date_hired,
      shift_start,
      shift_end,
    } = req.body;

    let hashedPassword = null;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await sql`
      UPDATE users
      SET
        username = COALESCE(${username}, username),
        password_hash = COALESCE(${hashedPassword}, password_hash),
        first_name = COALESCE(${first_name}, first_name),
        middle_name = COALESCE(${middle_name}, middle_name),
        last_name = COALESCE(${last_name}, last_name),
        suffix = COALESCE(${suffix}, suffix),
        sex = COALESCE(${sex}, sex),
        role = COALESCE(${role}, role),
        email = COALESCE(${email}, email),
        contact_number = COALESCE(${contact_number}, contact_number),
        emergency_contact_name = COALESCE(
          ${emergency_contact_name},
          emergency_contact_name
        ),
        emergency_contact = COALESCE(
          ${emergency_contact},
          emergency_contact
        ),
        address = COALESCE(${address}, address),
        birthdate = COALESCE(${birthdate}, birthdate),
        department = COALESCE(${department}, department),
        employment_status = COALESCE(
          ${employment_status},
          employment_status
        ),
        account_status = COALESCE(
          ${account_status},
          account_status
        ),
        date_hired = COALESCE(${date_hired}, date_hired),
        shift_start = COALESCE(${shift_start}, shift_start),
        shift_end = COALESCE(${shift_end}, shift_end),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user_id}
      RETURNING *;
    `;

    res.status(200).json({
      message: "User updated successfully!",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}