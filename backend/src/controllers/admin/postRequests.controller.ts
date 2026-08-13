import { sql } from "../../config/db.js";
import cloudinary from "../../config/cloudinary.js";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  generateUserId,
  generateServiceId,
  generateActivityId,
} from "../../utils/generateId.js";

///// the tokenantion on ad user is just for testing purposes,
/// it will be removed later on. optional lang kasi no need tokens right after sign up, its usually on login========
export async function addUser(req: Request, res: Response) {
  // post /api/admin/users
  try {
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
      date_hired,
      shift_start,
      shift_end,
    } = req.body;
    if (
      !username ||
      !password ||
      !first_name ||
      !last_name ||
      !sex ||
      !birthdate ||
      !address ||
      !role ||
      !date_hired ||
      !email ||
      !contact_number
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
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
    const userId = await generateUserId();
    const uploadPromise = await cloudinary.uploader.upload(req.file.path, {
      folder: "techcare/user_photos",
    });
    const profile_photo = uploadPromise.secure_url;
    // if you are going to upload multipple files
    // let imageUrls: string[] = [];

    // if (req.files) {
    //     const files = req.files as Express.Multer.File[];

    //     const uploadedImages = await Promise.all(
    //         files.map((file) =>
    //             cloudinary.uploader.upload(file.path, {
    //                 folder: "TechCare/patients",
    //             })
    //         )
    //     );

    //     imageUrls = uploadedImages.map((image) => image.secure_url);
    // }
    const signUpResult = await sql`
        INSERT INTO users (
            user_id, 
            username, 
            password_hash, 
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
            date_hired, 
            shift_start, 
            shift_end, 
            profile_photo
        ) 
        VALUES (
            ${userId}, 
            ${username}, 
            ${hashedPassword}, 
            ${first_name}, 
            ${middle_name ?? null}, 
            ${last_name}, 
            ${suffix ?? null},
            ${sex}, 
            ${email}, 
            ${contact_number}, 
            ${emergency_contact_name ?? null}, 
            ${emergency_contact ?? null}, 
            ${address}, 
            ${birthdate},
            ${role}, 
            ${department ?? null}, 
            ${employment_status ?? null}, 
            ${date_hired}, 
            ${shift_start ?? "08:00:00"}, 
            ${shift_end ?? "17:00:00"}, 
            ${profile_photo ?? null}) 
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
    console.error(error);
    res.status(500).json({ error: " Error on uplaoding new user" });
  }
}

export async function addService(req: Request, res: Response) {
  // post /api/admin/services
  try {
    const { service_name, price, service_type, room } = req.body;
    if (
      !service_name ||
      price === undefined ||
      price === null ||
      !service_type ||
      !room
    ) {
      return res.status(400).json({ message: "All fields are required" });
    } else if (isNaN(price)) {
      return res.status(400).json({ message: "Price must be a number" });
    }

    const existingService = await sql`
        SELECT * FROM services
        WHERE service_name = ${service_name}
    `;
    if (existingService.length > 0) {
      return res.status(200).json({ message: "Service already exists" });
    }
    const serviceId = await generateServiceId();
    const newService = await sql`
      INSERT INTO services (service_id, service_name, price, service_type, room)
      VALUES (${serviceId}, ${service_name}, ${price}, ${service_type}, ${room})
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

export async function addActivity(req: Request, res: Response) {
  // post /api/admin/activities
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
    const activityId = await generateActivityId();
    const response = await sql`
      INSERT INTO system_activity (activity_id, user_id, service_name, details)
      values (${activityId}, ${user_id}, ${service_name}, ${details})
    `;
    res.status(201).json({ user: response[0], message: "Sign up successful!" });
  } catch (error) {
    res.status(500).json({ error: "error on adding activity controller" });
  }
}
