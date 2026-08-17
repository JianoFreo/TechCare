import { sql } from "../../config/db.js";
import { Request, Response } from "express";
import { generateLaboratoryRequestID } from "../../utils/generateId.js";
import { generateLaboratoryItemID } from "../../utils/generateId.js";

export async function addLaboratoryRequest(req: Request, res: Response) {
  try {
    const { patient_id, services } = req.body;

    if (!patient_id || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        message:
          "Patient ID is required and at least one service must be provided.",
      });
    }

    const request_id = await generateLaboratoryRequestID();

    const laboratory_request_result = await sql`
      INSERT INTO laboratory_requests (
        request_id,
        patient_id,
        is_paid
      )
      VALUES (
        ${request_id},
        ${patient_id},
        TRUE
      )
      RETURNING *
    `;

    if (laboratory_request_result.length === 0) {
      return res.status(400).json({
        message: "Failed adding laboratory request header.",
      });
    }

    const laboratory_item_result = await Promise.all(
      services.map(async (service: { service_id: string }) => {
        const service_id = service.service_id;
        const lab_item_id = await generateLaboratoryItemID();

        const insertedItem = await sql`
          INSERT INTO request_items (
            lab_item_id,
            request_id,
            service_id,
            status
          )
          VALUES (
            ${lab_item_id},
            ${request_id},
            ${service_id},
            'Requested'
          )
          RETURNING *
        `;

        return insertedItem[0];
      }),
    );

    return res.status(201).json({
      message: "Laboratory request added successfully.",
      request: laboratory_request_result,
      items: laboratory_item_result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
