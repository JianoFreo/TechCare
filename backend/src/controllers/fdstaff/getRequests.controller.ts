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
