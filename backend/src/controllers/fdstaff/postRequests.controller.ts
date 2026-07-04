import { sql } from "../../config/db.js";
import { calculateAge } from "../../utils/calculateAge.js";
import { json, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";
import cloudinary from "../../config/cloudinary.js";

export async function addPatient(req: Request, res: Response) {
  // POST /api/fdstaff/patients
  try {
    console.log(cloudinary.config());
    console.log(ENV.CLOUDINARY_CLOUD_NAME);
    console.log(ENV.CLOUDINARY_API_KEY);
    console.log(ENV.CLOUDINARY_API_SECRET);
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log(await cloudinary.api.ping());

    const {
      last_name,
      first_name,
      date_of_birth,
      sex,
      contact_number,
      email,
      address,
      emergency_contact,
    } = req.body;

    // Validate required fields
    if (!last_name || !first_name || !date_of_birth || !sex) {
      return res.status(400).json({
        message:
          "patient_id, last_name, first_name, date_of_birth, and sex are required.",
      });
    }
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const uploadPromise = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });
    const imageUrl = uploadPromise.secure_url;
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

    const response = await sql`
            INSERT INTO patients (
                last_name,
                first_name,
                date_of_birth,
                sex,
                contact_number,
                email,
                address,
                emergency_contact,
                image_url

            )
            VALUES (
                ${last_name},
                ${first_name},
                ${date_of_birth},
                ${sex},
                ${contact_number ?? null},
                ${email ?? null},
                ${address ?? null},
                ${emergency_contact ?? null},
                ${imageUrl ?? null}
            )
            RETURNING *;
        `;
    const age = calculateAge(date_of_birth);

    return res.status(201).json({
      message: "Patient added successfully.",
      patient: { ...response[0], age },
    });
    // {
    //     "message": "Patient added successfully.",
    //     "patient": {
    //         "patient_id": "P-2024-0427-001",
    //         "last_name": "Doe",
    //         "first_name": "John",
    //         "date_of_birth": "1990-01-01",
    //         "sex": "Male",
    //         "contact_number": "09123456789",
    //         "email": "patient@example.com",
    //         "address": "123 Main St",
    //         "emergency_contact": "Jane Doe",
    //         "created_at": "2024-04-27T12:34:56.789Z",
    //         "updated_at": "2024-04-27T12:34:56.789Z",
    //     }
    // }
  } catch (error: any) {
    console.dir(error, { depth: null });

    if (error.error) {
      console.dir(error.error, { depth: null });
    }

    if (error.response) {
      console.dir(error.response, { depth: null });
    }
  }
}

export async function addBills(req: Request, res: Response) {
  try {
    const {
      patient_id,
      services_ids = [],
      discount_pct = 0,
      custom_service = [],
      payment_method = "Cash",
      status = "Unpaid",
    }: {
      patient_id: string;
      services_ids: number[];
      discount_pct?: number;
      custom_service?: {
        service_name: string;
        price: number;
      }[];
      payment_method?: string;
      status?: string;
    } = req.body;

    // {
    //   "patient_id": "P-2024-0001",
    //   "services_ids": [1, 3],
    //   "custom_service": [
    //     {
    //       "service_name": "Medical Certificate",
    //       "price": 200
    //     },
    //     {
    //       "service_name": "Home Visit Fee",
    //       "price": 500
    //     }
    //   ],
    //   "discount_pct": 10,
    //   "payment_method": "Cash",
    //   "status": "Unpaid"
    // }

    const services: {
      service_name: string;
      price: number;
    }[] = [];

    // Fetch services from the database
    for (let i = 0; i < services_ids.length; i++) {
      const service = await sql`
                SELECT price, service_name
                FROM services
                WHERE service_id = ${services_ids[i]}
            `;

      if (service.length === 0) {
        return res.status(404).json({
          message: `Service ID ${services_ids[i]} not found`,
        });
      }

      services.push({
        service_name: service[0].service_name,
        price: Number(service[0].price),
      });
    }

    // Add custom services
    services.push(...custom_service);

    const service_total = services.reduce(
      (sum, service) => sum + service.price,
      0,
    );

    const discount = service_total * (discount_pct / 100);
    const total_amount = service_total - discount;

    const bill = await sql`
            INSERT INTO bills (
                patient_id,
                services_ids,
                discount_pct,
                total_amount,
                payment_method,
                status
            )
            VALUES (
                ${patient_id},
                ${services_ids},
                ${discount_pct},
                ${total_amount},
                ${payment_method},
                ${status}
            )
            RETURNING *;
        `;

    return res.status(201).json({
      message: "Bill created successfully",
      bill: {
        ...bill[0],
        services,
      },
    });

    // {
    //   "message": "Bill created successfully",
    //   "bill": {
    //     "bill_id": 15,
    //     "patient_id": "P-2024-0001",
    //     "services_ids": [1, 3],
    //     "services": [
    //       {
    //         "service_name": "Complete Blood Count (CBC)",
    //         "price": 500
    //       },
    //       {
    //         "service_name": "Chest X-Ray",
    //         "price": 800
    //       },
    //       {
    //         "service_name": "Medical Certificate",
    //         "price": 200
    //       },
    //       {
    //         "service_name": "Home Visit Fee",
    //         "price": 500
    //       }
    //     ],
    //     "discount_pct": "10.00",
    //     "total_amount": "1800.00",
    //     "payment_method": "Cash",
    //     "status": "Unpaid",
    //     "receipt_id": null,
    //     "created_at": "2026-07-02T11:45:12.931Z",
    //     "receipt_issued_at": null,
    //     "billed_at": "2026-07-02T11:45:12.931Z"
    //   }
    // }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
