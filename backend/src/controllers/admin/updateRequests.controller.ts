import { sql } from "../../config/db.js";
import cloudinary from "../../config/cloudinary.js";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { logActivity } from "../../utils/activityLogger.js";
import type {
  updateUser,
  updateUserStatus,
  updateFormTemplate,
} from "./dto/update.dto.js";

// =========================
// UPDATE USER
// =========================
export async function updateUser(
  req: Request<updateUser.params, updateUser.body>,
  res: Response<updateUser.response | updateUser.error>,
) {
  // PATCH /api/admin/users/:user_id

  try {
    const { user_id } = req.params;

    const {
      username,
      password,
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
    } = req.body as updateUser.body;

    // =========================
    // PASSWORD
    // =========================

    let hashedPassword: string | null = null;

    if (password?.trim()) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // =========================
    // PROFILE PHOTO
    // =========================

    let profilePhoto: string | null = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "techcare/user_photos",
      });

      profilePhoto = uploadResult.secure_url;
    }

    // =========================
    // UPDATE USER
    // =========================

    const updatedUser = await sql`
      UPDATE users
      SET
        username = COALESCE(${username ?? null}, username),
        password_hash = COALESCE(${hashedPassword}, password_hash),
        first_name = COALESCE(${first_name ?? null}, first_name),
        middle_name = COALESCE(${middle_name ?? null}, middle_name),
        last_name = COALESCE(${last_name ?? null}, last_name),
        suffix = COALESCE(${suffix ?? null}, suffix),
        sex = COALESCE(${sex ?? null}, sex),
        email = COALESCE(${email ?? null}, email),
        contact_number = COALESCE(${contact_number ?? null}, contact_number),
        emergency_contact_name = COALESCE(${emergency_contact_name ?? null}, emergency_contact_name),
        emergency_contact = COALESCE(${emergency_contact ?? null}, emergency_contact),
        address = COALESCE(${address ?? null}, address),
        birthdate = COALESCE(${birthdate ?? null}, birthdate),
        role = COALESCE(${role ?? null}, role),
        department = COALESCE(${department ?? null}, department),
        employment_status = COALESCE(${employment_status ?? null}, employment_status),
        date_hired = COALESCE(${date_hired ?? null}, date_hired),
        shift_start = COALESCE(${shift_start ?? null}, shift_start),
        shift_end = COALESCE(${shift_end ?? null}, shift_end),
        profile_photo = COALESCE(${profilePhoto}, profile_photo),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user_id}
      RETURNING *;
    `;

    // =========================
    // USER NOT FOUND
    // =========================

    if (updatedUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
      } as updateUser.error);
    }

    // =========================
    // REMOVE SENSITIVE DATA
    // =========================

    const { password_hash, ...safeUser } = updatedUser[0];

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      message: "User updated successfully!",
      user: safeUser,
    } as updateUser.response);
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to update user",
    } as updateUser.error);
  }
}

// =========================
// UPDATE USER STATUS
// =========================
export async function updateUserStatus(
  req: Request<updateUserStatus.params, updateUserStatus.body>,
  res: Response<updateUserStatus.response | updateUserStatus.error>,
) {
  try {
    const { user_id } = req.params;
    const { account_status } = req.body as updateUserStatus.body;

    if (account_status === undefined) {
      return res.status(400).json({
        message: "Account status is required.",
      } as updateUserStatus.error);
    }

    if (typeof account_status !== "boolean") {
      return res.status(400).json({
        message: "Account status must be a boolean.",
      } as updateUserStatus.error);
    }

    if (user_id === req.user.user_id) {
      await logActivity({
        userId: req.user.user_id,
        actionName: "user.deactivate",
        status: "blocked",
        targetType: "user",
        targetId: user_id,
        metadata: { reason: "self-deactivation attempt" },
      });

      return res.status(400).json({
        message: `You can't ${account_status ? "activate" : "deactivate"} your own account.`,
      } as updateUserStatus.error);
    }

    const updatedAccountStatus = await sql`
      UPDATE users
      SET
        account_status = ${account_status},
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user_id}
      RETURNING
        user_id,
        first_name,
        last_name,
        middle_name,
        role,
        account_status;
    `;

    if (updatedAccountStatus.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      } as updateUserStatus.error);
    }

    await logActivity({
      userId: req.user.user_id,
      actionName: account_status ? "user.activate" : "user.deactivate",
      status: "success",
      targetType: "user",
      targetId: user_id,
      metadata: {
        newStatus: account_status ? "activated" : "deactivated",
      },
    });

    return res.status(200).json({
      message: `User successfully ${account_status ? "activated" : "deactivated"}.`,
      updatedAccountStatus,
    } as updateUserStatus.response);
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error.",
    } as updateUserStatus.error);
  }
}

// =========================
// UPDATE FORM TEMPLATE
// =========================
export async function updateFormTemplate(
  req: Request<updateFormTemplate.params>,
  res: Response<updateFormTemplate.response | updateFormTemplate.error>,
) {
  const { form_id } = req.params;
  const { form_name, form_description, status, form_components } =
    req.body as updateFormTemplate.body;

  if (!form_id) {
    return res.status(400).json({
      message: "form_id is required.",
    } as updateFormTemplate.error);
  }

  if (
    !form_name ||
    !Array.isArray(form_components) ||
    form_components.length === 0
  ) {
    return res.status(400).json({
      message: "Required fields missing.",
    } as updateFormTemplate.error);
  }

  try {
    const [checkExisting] = await sql`
      SELECT *
      FROM form_templates
      WHERE form_id = ${form_id}
    `;

    if (!checkExisting) {
      return res.status(404).json({
        message: "Form template not found.",
      } as updateFormTemplate.error);
    }

    // NOTE: For Neon HTTP queries, separate BEGIN/COMMIT calls may not share
    // the same connection. Use a transaction-capable client for atomic writes.

    const [formUpdated] = await sql`
      UPDATE form_templates
      SET
        form_name = ${form_name},
        form_description = ${form_description ?? null},
        status = ${status},
        version = version + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE form_id = ${form_id}
      RETURNING *
    `;

    await sql`
      DELETE FROM form_components
      WHERE form_id = ${form_id}
    `;

    const componentsUpdated: updateFormTemplate.component[] = [];

    for (let index = 0; index < form_components.length; index++) {
      const componentData = form_components[index];
      const form_component_id = `FC-${form_id}-${index}`;

      const [component] = await sql`
        INSERT INTO form_components (
          form_component_id,
          form_id,
          type_id,
          label,
          field_key,
          display_order,
          settings,
          validation
        )
        VALUES (
          ${form_component_id},
          ${form_id},
          ${componentData.type_id},
          ${componentData.label},
          ${componentData.field_key},
          ${componentData.display_order},
          ${JSON.stringify(componentData.settings ?? null)}::jsonb,
          ${JSON.stringify(componentData.validation ?? null)}::jsonb
        )
        RETURNING *
      `;

      componentsUpdated.push(component as updateFormTemplate.component);
    }

    return res.status(200).json({
      message: "Form template updated successfully",
      formUpdated: formUpdated as updateFormTemplate.template,
      componentsUpdated,
    } as updateFormTemplate.response);
  } catch (error) {
    console.error("UPDATE FORM TEMPLATE ERROR:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    } as updateFormTemplate.error);
  }
}
