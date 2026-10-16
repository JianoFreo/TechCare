import { sql } from "../../config/db.js";
import { Request, Response } from "express";
import type {
  getAllUsers as GetAllUsersDTO,
  getAllActivities as GetAllActivitiesDTO,
  getAllservices as GetAllServicesDTO,
  getMyActivities as GetMyActivitiesDTO,
  getAllFormTemplates as GetAllFormTemplatesDTO,
  getFormTemplateById as GetFormTemplateByIdDTO,
} from "./dto/get.dto.js";

// =========================
// GET ALL USERS
// =========================
export async function getAllUsers(
  req: Request,
  res: Response<GetAllUsersDTO.response | GetAllUsersDTO.error>,
) {
  // GET /api/admin/users
  try {
    const users = await sql`
      SELECT
        id,
        user_id,
        username,
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
        last_login,
        account_status,
        profile_photo,
        active,
        created_at,
        updated_at
      FROM users
    `;

    return res.status(200).json({
      users,
    } as GetAllUsersDTO.response);
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);

    return res.status(500).json({
      message: "Error while fetching users",
    } as GetAllUsersDTO.error);
  }
}

// Example response:
// {
//   "users": [
//     {
//       "user_id": "USR-2026-0001",
//       "username": "admin",
//       "first_name": "Admin",
//       "middle_name": null,
//       "last_name": "User",
//       "suffix": null,
//       "sex": "Male",
//       "email": "admin@example.com",
//       "contact_number": "1234567890",
//       "emergency_contact_name": "Emergency Contact",
//       "emergency_contact": "09123456789",
//       "address": "Manila, Philippines",
//       "birthdate": "1990-01-01",
//       "role": "Administrator",
//       "department": "Administration",
//       "employment_status": "Regular",
//       "date_hired": "2026-06-28",
//       "shift_start": "08:00:00",
//       "shift_end": "17:00:00",
//       "profile_photo": "https://...",
//       "created_at": "2026-06-28T20:19:10.904Z",
//       "updated_at": "2026-06-28T20:19:10.904Z"
//     }
//   ]
// }

// =========================
// GET ALL ACTIVITIES
// =========================
export async function getAllActivities(
  req: Request,
  res: Response<GetAllActivitiesDTO.response | GetAllActivitiesDTO.error>,
) {
  // GET /api/admin/activities
  try {
    const activities = await sql`
      SELECT
        al.id,
        al.user_id,
        a.action_name,
        a.action_description,
        a.module,
        a.is_sensitive,
        al.status,
        al.target_type,
        al.target_id,
        al.metadata,
        al.created_at
      FROM activity_logs al
      JOIN actions a ON a.action_id = al.action_id
      ORDER BY al.created_at DESC
    `;

    if (activities.length === 0) {
      return res.status(200).json({
        activities: [],
        message: "there are no activities",
      } as GetAllActivitiesDTO.response);
    }

    return res.status(200).json({
      activities,
    } as GetAllActivitiesDTO.response);
  } catch (error) {
    console.error("GET ALL ACTIVITIES ERROR:", error);

    return res.status(500).json({
      error: "error on get acts controller",
    } as GetAllActivitiesDTO.error);
  }
}

//----------------------------------------------------------------------------------------------------------------//

// =========================
// GET ALL SERVICES
// =========================
export async function getAllservices(
  req: Request,
  res: Response<GetAllServicesDTO.response | GetAllServicesDTO.error>,
) {
  // GET /api/admin/services
  try {
    const services = await sql`
      SELECT *
      FROM services
    `;

    return res.status(200).json({
      services,
    } as GetAllServicesDTO.response);

    // {
    //   "services": [
    //     {
    //       "service_id": "SVC-2026-0001",
    //       "service_type": "Laboratory",
    //       "service_name": "Blood Test",
    //       "price": "250.00",
    //       "active": true,
    //       "room": "Laboratory",
    //       "service_category": "Diagnostic",
    //       "created_at": "2026-07-02T08:00:00.000Z",
    //       "updated_at": "2026-07-02T08:00:00.000Z"
    //     }
    //   ]
    // }
  } catch (error) {
    console.error("GET ALL SERVICES ERROR:", error);

    return res.status(500).json({
      error: "Internal Server Error",
    } as GetAllServicesDTO.error);
  }
}

//----------------------------------------------------------------------------------------------------------------//

// =========================
// GET MY ACTIVITIES
// =========================
export async function getMyActivities(
  req: Request,
  res: Response<GetMyActivitiesDTO.response | GetMyActivitiesDTO.error>,
) {
  // GET /api/admin/activity
  try {
    const activities = await sql`
      SELECT *
      FROM system_activity
      WHERE user_id = ${req.user.user_id}
      ORDER BY created_at DESC
    `;

    if (activities.length === 0) {
      return res.status(200).json({
        message: "You have no activities",
        activities: [],
      } as GetMyActivitiesDTO.response);
    }

    return res.status(200).json({
      activities,
    } as GetMyActivitiesDTO.response);

    // {
    //   "activities": [
    //     {
    //       "activity_id": "ACT-2026-0001",
    //       "user_id": "USR-2026-0001",
    //       "service_name": "Blood Test",
    //       "details": {
    //         "action": "Created request"
    //       },
    //       "created_at": "2026-06-28T20:19:10.904Z"
    //     }
    //   ]
    // }
  } catch (error) {
    console.error("GET MY ACTIVITIES ERROR:", error);

    return res.status(500).json({
      error: "error on get your activities",
    } as GetMyActivitiesDTO.error);
  }
}

// =========================
// GET ALL FORM TEMPLATES
// =========================
export async function getAllFormTemplates(
  req: Request,
  res: Response<GetAllFormTemplatesDTO.response | GetAllFormTemplatesDTO.error>,
) {
  try {
    const { service_id, status } = req.query as GetAllFormTemplatesDTO.query;

    const templates = await sql`
      SELECT *
      FROM form_templates
      WHERE
        (${service_id ?? null}::VARCHAR IS NULL
          OR service_id = ${service_id ?? null})
        AND (${status ?? null}::VARCHAR IS NULL
          OR status = ${status ?? null})
      ORDER BY created_at DESC
    `;

    return res.status(200).json({
      message: "Form templates fetched successfully",
      formTemplates: templates,
    } as GetAllFormTemplatesDTO.response);
  } catch (error) {
    console.error("GET ALL FORM TEMPLATES ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error.",
    } as GetAllFormTemplatesDTO.error);
  }
}

// =========================
// GET FORM TEMPLATE BY ID
// =========================
export async function getFormTemplateById(
  req: Request<GetFormTemplateByIdDTO.request>,
  res: Response,
) {
  try {
    const { form_id } = req.params;

    if (!form_id) {
      return res.status(400).json({
        message: "Form ID is required.",
      } as GetFormTemplateByIdDTO.error);
    }

    const [formTemplate] = await sql`
      SELECT *
      FROM form_templates
      WHERE form_id = ${form_id}
    `;

    if (!formTemplate) {
      return res.status(404).json({
        message: "Form template not found.",
      } as GetFormTemplateByIdDTO.error);
    }

    const components = await sql`
      SELECT *
      FROM form_components
      WHERE form_id = ${form_id}
      ORDER BY display_order ASC
    `;

    return res.status(200).json({
      message: "Form template fetched successfully",
      formTemplate,
      components,
    } as GetFormTemplateByIdDTO.response);
  } catch (error) {
    console.error("GET FORM TEMPLATE BY ID ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    } as GetFormTemplateByIdDTO.error);
  }
}
