import cloudinary from "../../config/cloudinary.js";
import { sql } from "../../config/db.js";
import { ENV } from "../../config/env.js";
import { calculateAge } from "../../utils/calculateAge.js";
import { json, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  generateConsultationQueueId,
  generateLaboratoryQueueId,
  generatePatientId,
  generateLaboratoryRequestID,
  generateQueueNumberConsultation,
  generateQueueNumberLaboratory,
} from "../../utils/generateId.js";
export async function addPatient(req: Request, res: Response) {
  // POST /api/fdstaff/patients
  try {
    // console.log(cloudinary.config());
    // console.log(ENV.CLOUDINARY_CLOUD_NAME);
    // console.log(ENV.CLOUDINARY_API_KEY);
    // console.log(ENV.CLOUDINARY_API_SECRET);
    // console.log("BODY:", req.body);
    // console.log("FILE:", req.file);
    // console.log(await cloudinary.api.ping());

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
    // check if patiengt exists

    const existingPatient = await sql`
      SELECT *
      FROM patients
      WHERE last_name = ${last_name}
        AND first_name = ${first_name}
        AND date_of_birth = ${date_of_birth}
        AND contact_number = ${contact_number}
        AND email = ${email}
    `;
    if (existingPatient.length > 0) {
      return res.status(400).json({
        message:
          "A patient with the same name, contact number, email, and date of birth already exists.",
      });
    }

    const patientId = await generatePatientId();
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
                patient_id,
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
                ${patientId},
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

// export async function addQueueEntry(req: Request, res: Response) {
//   try {
//     const { patient_id, service_id, service_type, is_priority } = req.body;
//     let total;
//     if (is_priority) {
//       total = await sql`
//         SELECT COUNT(*) AS total
//         FROM queue_entries
//         WHERE is_priority = TRUE
//     `;
//     } else {
//       total = await sql`
//       SELECT COUNT(*) AS total
//       FROM queue_entries
//       WHERE is_priority = FALSE
//     `;
//     }
//     if (!patient_id || !service_id || !service_type) {
//       return res.status(400).json({
//         message: "patient_id, service_id, and service_type are required.",
//       });
//     }
//     let queueId;
//     if (service_type === "consultation") {
//       queueId = await generateConsultationQueueId();
//     }
//     if (service_type === "laboratory") {
//       queueId = await generateLaboratoryQueueId();
//     }
//     let patientName = null;
//     if (patient_id) {
//       patientName = await sql`
//     SELECT last_name, first_name
//     FROM patients
//     WHERE patient_id = ${patient_id}
//     `;
//       if (patientName.length === 0) {
//         return res
//           .status(404)
//           .json({ message: "the patient id you entered doesnt exist" });
//       }
//       patientName = patientName[0].last_name + ", " + patientName[0].first_name;
//     }
//     const newQueueNumber = Number(total[0].total) + 1;
//     const newQueue = await sql`
//         INSERT INTO queue_entries (queue_id, patient_id, patient_name, queue_number, service_id, service_type)
//         VALUES (${queueId}, ${patient_id}, ${patientName}, ${newQueueNumber}, ${service_id}, ${service_type})
//         RETURNING *;
//     `;
//     res.status(200).json({ newQueue, message: "added to queue" });
//     console.log(newQueueNumber);
//   } catch (error) {
//     console.log(error);
//   }
// }

export async function addQueueEntry(req: Request, res: Response) {
  try {
    // Get the data sent by the frontend
    const { patient_id, service_id, service_name, is_priority } = req.body;

    // Make sure a service was selected
    if (!service_id) {
      return res.status(400).json({
        message: "service_id and service_type are required.",
      });
    }

    // Retrieve the service type (consultation or laboratory)
    // based on the selected service_id
    const serviceType = await sql`
      SELECT service_type
      FROM services
      WHERE service_id = ${service_id}
    `;

    // Variables that will store the generated queue ID
    // and queue number
    let queueId;
    let queueNumber;

    // Generate consultation queue ID and number
    if (serviceType[0].service_type === "consultation") {
      queueId = await generateConsultationQueueId();
      queueNumber = await generateQueueNumberConsultation(); // Exammple return : CONS-0017
    }

    // Generate laboratory queue ID and number
    if (serviceType[0].service_type === "laboratory") {
      queueId = await generateLaboratoryQueueId();
      queueNumber = await generateQueueNumberLaboratory(); // Example return: LAB-0017
    }

    // Default patient name for walk-in patients
    let patientName = null;

    // If a patient ID was entered, verify that it exists
    if (patient_id) {
      patientName = await sql`
        SELECT last_name, first_name
        FROM patients
        WHERE patient_id = ${patient_id}
      `;

      // If no patient matches the entered ID,
      // return a 404 error
      if (patientName.length === 0) {
        return res
          .status(404)
          .json({ message: "The patient ID you entered doesn't exist." });
      }

      // Convert the patient's first and last name
      // into a single display string
      patientName = patientName[0].last_name + ", " + patientName[0].first_name;
    }

    // Insert the new queue entry into the database
    const newQueue = await sql`
      INSERT INTO queue_entries (
        queue_id,
        patient_id,
        patient_name,
        queue_number,
        service_id,
        service_name,
        service_type,
        is_priority
      )
      VALUES (
        ${queueId},
        ${patient_id},
        ${patientName},
        ${queueNumber},
        ${service_id},
        ${service_name},
        ${serviceType[0].service_type},
        ${is_priority}
      )
      RETURNING *;
    `;

    // Send the newly created queue entry back to the client
    res.status(200).json({
      newQueue,
      message: "Added to queue",
    });
  } catch (error) {
    // Log unexpected server/database errors
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function addLaboratoryRequest(req: Request, res: Response) {
  try {
    const { patient_id, test_type } = req.body;

    if (!patient_id || !test_type) {
      return res.status(400).json({
        message: "Patient ID, Doctor ID, and Test type is required!",
      });
    }
    const labreq_id = await generateLaboratoryRequestID();
    const response = await sql`
    INSERT INTO lab_requests(
      request_id,
      patient_id,
      test_type
    )
      VALUES(
      ${labreq_id},
      ${patient_id},
      ${test_type}
    ) RETURNING *
    `;
    return res.status(201).json({
      message: "Laboratory request added succesfully.",
      labrequest: response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
