import { sql } from "../../config/db.js";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export async function addUser(req: Request, res: Response) {
  // post /api/admin/users
  try {
    const { username, password, role, full_name, email, contact_number } =
      req.body;
    if (
      !username ||
      !password ||
      !role ||
      !full_name ||
      !email ||
      !contact_number
    ) {
      return res.status(400).json({ message: "All fields are required" });
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
    console.log("INSERT RESULT:", signUpResult);
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
export async function addService(req: Request, res: Response) {
  // post /api/admin/services
  try {
    const { service_name, price } = req.body;
    if (!service_name || price === undefined || price === null) {
      return res.status(400).json({ message: "All fields are required" });
    } else if (isNaN(price)) {
      return res.status(400).json({ message: "Price must be a number" });
    }
    const newService = await sql`
      INSERT INTO services (service_name, price)
      VALUES (${service_name}, ${price})
      RETURNING *;
    `;
    res
      .status(201)
      .json({ message: "Service added successfully!", service: newService[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "error on service controller" });
  }
}

export async function addActivity(req: Request, res: Response) { // post /api/admin/activities
  try {
    const user_id = req.user.user_id;
    const { activity_id, service_name, details } = req.body;
    const serviceName = await sql`
    SELECT service_name
    FROM services
    WHERE service_name = ${service_name}
    `;
    if (!serviceName) {
      res.json({ message: "there is no service on that on our database" });
    }

    const response = await sql`
      INSERT INTO system_activity (user_id, service_name, details)
      values (${user_id}, ${service_name}, ${details})
    `;
    res.status(201).json({ user: response[0], message: "Sign up successful!" });
  } catch (error) {
    res.status(500).json({ error: "error on adding activity controller" });
  }
}
