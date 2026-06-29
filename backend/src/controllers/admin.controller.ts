import { sql } from "../config/db.js";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await sql`SELECT * FROM users`;
    if (!users) {
      res.json({ message: "there are no users " });
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateUser(req: Request, res: Response) {
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

export async function addUser(req: Request, res: Response) {
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

export async function getAllservices(req: Request, res: Response) {
  try {
    const services = await sql`SELECT * FROM services`;
    res.status(200).json({ services });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function addService(req: Request, res: Response) {
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

export async function getAllActivities(req: Request, res: Response) {
  try {
 
    const activities = await sql`
      SELECT
          sa.*,
          u.username
      FROM system_activity sa
      JOIN users u
      ON sa.user_id = u.user_id;
`;
    if (!activities) {
      res.json({ message: "there are no activities" });
      {
    // "activities": [
    //     {
    //         "activity_id": 1,
    //         "user_id": 11,
    //         "service_name": "pakalbo",
    //         "details": {
    //             "kalbo": "panot",
    //             "semiKal": "utot"
    //         },
    //         "created_at": "2026-06-28T20:19:10.904Z",
    //         "username": "testing"
    //     },
    //     {
    //         "activity_id": 2,
    //         "user_id": 11,
    //         "service_name": "pakalbo",
    //         "details": {
    //             "kalbo": "panot",
    //             "semiKal": "utot"
    //         },
    //         "created_at": "2026-06-28T20:19:22.051Z",
    //         "username": "testing"
    //     }
    // ]
}
    }

    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ error: "error on get acts controller" });
  }
}
export async function getMyActivities(req: Request, res: Response) {
  try {
    const response = await sql`
    SELECT * FROM system_activity
    WHERE user_id = ${req.user.user_id}
    `;
    const activities = response[0];
    if (!activities) {
      res.json({ message: "You have no activities " });
    }

    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ error: "error on get your activities" });
  }
}
export async function addActivity(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user_id = req.user.user_id;
    const { activity_id, service_name, details } = req.body;
    const serviceName = await sql`
    SELECT service_name
    FROM services
    WHERE service_name = ${service_name}
    `
    if (!serviceName){
      res.json({message: "there is no service on that on our database"})
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
