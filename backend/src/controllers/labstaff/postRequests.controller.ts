import { sql } from "../../config/db.js";
import { Request, Response } from "express";
import { generateLaboratoryRequestID } from "../../utils/generateId.js";
import { generateLaboratoryItemID } from "../../utils/generateId.js";

// export async function addLaboratoryRequest(req: Request, res: Response) {
//   try {
//     const { patient_id, services } = req.body;

//     if (!patient_id || !Array.isArray(services) || services.length === 0) {
//       return res.status(400).json({
//         message:
//           "Patient ID is required and at least one service must be provided.",
//       });
//     }

//     const request_id = await generateLaboratoryRequestID();

//     const laboratory_request_result = await sql`
//       INSERT INTO laboratory_requests (
//         request_id,
//         patient_id,
//         is_paid
//       )
//       VALUES (
//         ${request_id},
//         ${patient_id},
//         TRUE
//       )
//       RETURNING *
//     `;

//     if (laboratory_request_result.length === 0) {
//       return res.status(400).json({
//         message: "Failed adding laboratory request header.",
//       });
//     }

//     const laboratory_item_result = await Promise.all(
//       services.map(async (service: { service_id: string }) => {
//         const service_id = service.service_id;
//         const lab_item_id = await generateLaboratoryItemID();

//         const insertedItem = await sql`
//           INSERT INTO request_items (
//             lab_item_id,
//             request_id,
//             service_id,
//             status
//           )
//           VALUES (
//             ${lab_item_id},
//             ${request_id},
//             ${service_id},
//             'Requested'
//           )
//           RETURNING *
//         `;

//         return insertedItem[0];
//       }),
//     );

//     return res.status(201).json({
//       message: "Laboratory request added successfully.",
//       request: laboratory_request_result,
//       items: laboratory_item_result,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       message: "Internal server error.",
//     });
//   }
// }

export async function saveLaboratoryResult(req: Request, res: Response) {
  try {
    const { lab_item_id } = req.params;
    const { results, remarks, image_url } = req.body;

    if (!lab_item_id) {
      return res.status(400).json({
        message: "Laboratory item ID is required.",
      });
    }

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        message: "At least one laboratory result is required.",
      });
    }

    const invalidResult = results.some(
      (item: { name?: string; result?: string | number }) =>
        !item ||
        typeof item.name !== "string" ||
        !item.name.trim() ||
        item.result === undefined ||
        item.result === null ||
        !["string", "number"].includes(typeof item.result) ||
        (typeof item.result === "string" && !item.result.trim()) ||
        (typeof item.result === "number" && !Number.isFinite(item.result)),
    );

    if (invalidResult) {
      return res.status(400).json({
        message: "Each result must have a valid name and value.",
      });
    }

    const [item] = await sql`
      SELECT lab_item_id
      FROM laboratory_request_items
      WHERE lab_item_id = ${lab_item_id}
      LIMIT 1
    `;

    if (!item) {
      return res.status(404).json({
        message: "Laboratory request item not found.",
      });
    }

    const [existingResult] = await sql`
      SELECT result_id
      FROM laboratory_results
      WHERE lab_item_id = ${lab_item_id}
      LIMIT 1
    `;

    if (existingResult) {
      const [updatedResult] = await sql`
        UPDATE laboratory_results
        SET
          results = ${JSON.stringify(results)}::jsonb,
          remarks = ${typeof remarks === "string" ? remarks.trim() || null : null},
          image_url = ${typeof image_url === "string" ? image_url.trim() || null : null},
          updated_at = NOW()
        WHERE lab_item_id = ${lab_item_id}
        RETURNING *
      `;

      return res.status(200).json({
        message: "Laboratory results updated successfully.",
        result: updatedResult,
      });
    }

    const result_id = `RES-${crypto.randomUUID()}`;

    const [savedResult] = await sql`
      INSERT INTO laboratory_results (
        result_id,
        lab_item_id,
        results,
        remarks,
        image_url
      )
      VALUES (
        ${result_id},
        ${lab_item_id},
        ${JSON.stringify(results)}::jsonb,
        ${typeof remarks === "string" ? remarks.trim() || null : null},
        ${typeof image_url === "string" ? image_url.trim() || null : null}
      )
      RETURNING *
    `;

    return res.status(201).json({
      message: "Laboratory results saved successfully.",
      result: savedResult,
    });
  } catch (error) {
    console.error("Error saving laboratory results:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}
