import { Request, Response } from "express";
import { sql } from "../../config/db.js";
import type { deleteTemplate as DeleteTemplateDTO } from "./dto/delete.dto.js";

export async function deleteTemplate(
  req: Request<DeleteTemplateDTO.request>,
  res: Response<
    DeleteTemplateDTO.response | DeleteTemplateDTO.error
  >,
) {
  try {
    const { form_id } = req.params as DeleteTemplateDTO.request;

    if (!form_id) {
      return res.status(400).json({
        message: "Form ID is required.",
      });
    }

    const [template] = await sql`
      DELETE FROM form_templates
      WHERE form_id = ${form_id}
      RETURNING *
    `;

    if (!template) {
      return res.status(404).json({
        message: "Form template not found.",
      });
    }

    return res.status(200).json({
      message: "Form template deleted successfully!",
      template: template as DeleteTemplateDTO.template,
    });
  } catch (error) {
    console.error("Error deleting form template:", error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
}