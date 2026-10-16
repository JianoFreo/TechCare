
import { sql } from "../../config/db.js";
import { Request, Response } from "express";
import type { deleteTemplate } from "./dto/delete.dto.js";

// =========================
// DELETE TEMPLATE
// =========================
export async function deleteTemplateController(
  req: Request<deleteTemplate.request>,
  res: Response<deleteTemplate.response | deleteTemplate.error>,
  
) {
  // DELETE /api/admin/templates/:form_id

  try {
    const { form_id } = req.params;

    if (!form_id) {
      return res.status(400).json({
        message: "form_id is required.",
      } as deleteTemplate.error);
    }

    const [existingTemplate] = await sql`
      SELECT form_id
      FROM form_templates
      WHERE form_id = ${form_id}
    `;

    if (!existingTemplate) {
      return res.status(404).json({
        message: "Template not found",
      } as deleteTemplate.error);
    }

    // Delete child records first because there is no ON DELETE CASCADE.
    await sql`
      DELETE FROM form_components
      WHERE form_id = ${form_id}
    `;

    const [deletedTemplate] = await sql`
      DELETE FROM form_templates
      WHERE form_id = ${form_id}
      RETURNING *
    `;

    return res.status(200).json({
      message: "Template deleted successfully!",
      template: deletedTemplate,
    } as deleteTemplate.response);
  } catch (error) {
    console.error("DELETE TEMPLATE ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete template",
    } as deleteTemplate.error);
  }
}
