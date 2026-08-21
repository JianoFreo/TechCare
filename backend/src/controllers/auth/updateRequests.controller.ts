import { Request, Response } from "express";
import { sql } from "../../config/db.js";

export async function logout(req: Request, res: Response) {
    try {
        const { user_id } = req.user;

        // =========================
        // REQUIRED CREDENTIALS
        // =========================
        if (!user_id) {
            return res.status(400).json({
                message: "User ID is required",
            });
        }

        await sql`
            UPDATE users
            SET active = FALSE
            WHERE user_id = ${user_id}
        `;

        return res.status(200).json({
            message: "Logout successful",
        });

    } catch (error) {
        console.error("Error logging out:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}