import { sql } from "../../config/db.js";
import { json, Request, Response } from "express";

export async function updateLabRequestStatus(req: Request, res: Response) {
  try {
    const { request_id } = req.params;
    const { status } = req.body;

    const updatedLabRequestStatus = await sql`
        UPDATE lab_requests
        SET status = ${status}
        WHERE request_id = ${request_id} AND
              is_paid = TRUE
        RETURNING *;
    `;

    if (updatedLabRequestStatus.length === 0) {
      return res.status(400).json({
        message: "Laboratory request doesn't exist.",
      });
    }

    return res.status(200).json({
      message: `Laboratory request status changed to ${status}.`,
      request: updatedLabRequestStatus,
    });
  } catch (error) {
    console.error;
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
