import { sql } from "../../config/db.js";
import bcrypt from "bcryptjs";
import { json, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function getAllPatients(req: Request, res: Response) {
  // get /api/fdstaff/patients
  try {
    const patients = sql`SELECT * FROM patients`;
    if (!patients) {
      res.json({ message: "there are no patients" });
    }
    res.status(200).json({ patients });
    // {
    //     "patient_id":1,
    //     "last_name":"Doe",
    //     "first_name":"John",
    //     "date_of_birth":"1990-01-01",
    //     "contact_number":"1234567890",
    //     "email":"patient@gmail.com",
    //     "address":"123 Main St",
    //     "emergency_contact":"Jane Doe",
    //     "created_at":"2026-07-02T00:00:00.000Z",
    //     "updated_at":"2026-07-02T00:00:00.000Z"
    // }
  } catch (error) {
    res.status(500).json({ error: "error on fetching patients" });
  }
}

export function getAllBilling(req: Request, res: Response) {
  // get /api/fdstaff/billing
  try {
    const billing = sql`SELECT * FROM billing`;
    if (!billing) {
      res.json({ message: "there are no billing records" });
    }
    res.status(200).json({ billing });
    // {
    //     "billing": [
    //         {
    //         "bill_id": 1,
    //         "patient_id": 1,
    //         "discount_pct": 0,
    //         "total_amount": 1000,
    //         "payment_method": "Cash",
    //         "status": "Paid",
    //         "receipt_id": "2026-07-02-0001",
    //         "billed_at": "2026-07-02T00:00:00.000Z"
    //         },
    //         {
    //         "bill_id": 2,
    //         "patient_id": 2,
    //         "discount_pct": 10,
    //         "total_amount": 900,
    //         "payment_method": "Credit Card",
    //         "status": "Unpaid",

    //     ]
    // }
  } catch (error) {
    res.status(500).json({ error: "error on fetching billing records" });
  }
}

export function getAllQueueEntries(req: Request, res: Response) {
  // get /api/fdstaff/queue
  try {
    const queueEntries = sql`SELECT * FROM queue`;
    if (!queueEntries) {
      res.json({ message: "there are no queue entries" });
    }
    res.status(200).json({ queueEntries });
    // {
    //     "queueEntries": [
    //         {
    //             "queue_id": 1,
    //             "patient_id": 1,
    //             "doctor_id": 1,
    //             "queue_number": 1,
    //             "service_type": "General Consultation",
    //             "status": "Waiting",
    //             "created_at": "2026-07-02T00:00:00.000Z",
    //             "updated_at": "2026-07-02T00:00:00.000Z"
    //         },
    //         {
    //             "queue_id": 2,
    //             "patient_id": 2,
    //             "doctor_id": 1,
    //             "queue_number": 2,
    //             "service_type": "General Consultation",
    //             "status": "Waiting",
    //             "created_at": "2026-07-02T00:00:00.000Z",
    //             "updated_at": "2026-07-02T00:00:00.000Z"
    //         },
    //     ]
    // }
  } catch (error) {
    res.status(500).json({ error: "error on fetching queue entries" });
  }
}
