import { Request, Response } from "express";
import { sql } from "../../config/db.js";


export async function deleteQueue(req: Request, res: Response) {
    try {
        const { queue_id } = req.params;

        // Delete the queue entry.
        // RETURNING returns the deleted row so we can verify it existed.
        const deletedQueue = await sql`
            DELETE FROM queue_entries
            WHERE queue_id = ${queue_id}
            RETURNING queue_id;
        `;

        // If nothing was returned, no queue with that ID existed.
        if (deletedQueue.length === 0) {
            return res.status(404).json({
                error: "Queue not found",
            });
        }

        return res.status(200).json({
            message: "Queue deleted successfully",
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Error deleting queue",
        });
    }
}