import { sql } from "../../config/db.js";
import { NextFunction, Request, Response } from "express";

export async function getAllUsers(req: Request, res: Response) { // get /api/admin/users
  try {
    const users = await sql`SELECT * FROM users`;
    if (!users) {
      res.json({ message: "there are no users " });
    }
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}
// {
//   "users":[{
//     "user_id": 1,
//     "username": "admin",
//     "password": "$2a$10$7Q1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F",
//     "role": "Administrator",
//     "full_name": "Admin User",
//     "email": "admin@example.com",
//     "contact_number": "1234567890",
//     "deleted": false,
//     "created_at": "2026-06-28T20:19:10.904Z",
//     "updated_at": "2026-06-28T20:19:10.904Z"
//   },
//   {
//     "user_id": 2,
//     "username": "doctor",
//     "password": "$2a$10$7Q1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F1J8F",
//     "role": "Doctor",
//     "full_name": "Doctor User",
//     "email": "doctor@example.com",
//     "contact_number": "0987654321",
//     "deleted": false,
//     "created_at": "2026-06-28T20:19:10.904Z",
//     "updated_at": "2026-06-28T20:19:10.904Z"
//   }]
// }
//----------------------------------------------------------------------------------------------------------------//
export async function getAllActivities(req: Request, res: Response) { // get /api/admin/activities
  try {
    const activities = await sql`
      SELECT
          sa.*,
          u.username
      FROM system_activity sa
      JOIN users u
      ON sa.user_id = u.user_id;
`;
    if (!activities) {
      res.json({ message: "there are no activities" });
      {
      }
    }

    res.status(200).json({ activities });
    // {
    //     "activities": [
    //         {
    //             "activity_id": 1,
    //             "user_id": 11,
    //             "service_name": "pakalbo",
    //             "details": {
    //                 "kalbo": "panot",
    //                 "semiKal": "utot"
    //             },
    //             "created_at": "2026-06-28T20:19:10.904Z",
    //             "username": "testing"
    //         },
    //         {
    //             "activity_id": 2,
    //             "user_id": 11,
    //             "service_name": "pakalbo",
    //             "details": {
    //                 "kalbo": "panot",
    //                 "semiKal": "utot"
    //             },
    //             "created_at": "2026-06-28T20:19:22.051Z",
    //             "username": "testing"
    //         }
    //     ]
    // }
  } catch (error) {
    res.status(500).json({ error: "error on get acts controller" });
  }
}
//----------------------------------------------------------------------------------------------------------------//

export async function getAllservices(req: Request, res: Response) { // get /api/admin/services
  try {
    const services = await sql`SELECT * FROM services`;
    if (!services) {
      res.json({ message: "there are no services" });
    }
    res.status(200).json({ services });

// {
//   "services": [
//   {
//     "service_id": 1,
//     "service_name": "Haircut",
//     "price": "250.00",
//     "discount_pct": "0.00",
//     "deleted": false,
//     "created_at": "2026-07-02T08:00:00.000Z",
//     "updated_at": "2026-07-02T08:00:00.000Z"
//   },
//   {
//     "service_id": 2,
//     "service_name": "Hair Coloring",
//     "price": "1200.00",
//     "discount_pct": "10.00",
//     "deleted": false,
//     "created_at": "2026-07-02T08:05:00.000Z",
//     "updated_at": "2026-07-02T08:05:00.000Z"
//   }
// ]
// }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
//----------------------------------------------------------------------------------------------------------------//


export async function getMyActivities(req: Request, res: Response) { // get /api/admin/activity
    try {
        const response = await sql`
    SELECT * FROM system_activity
    WHERE user_id = ${req.user.user_id}
    `;
        const activities = response[0];
        if (!activities) {
            res.json({ message: "You have no activities " });
        }

        res.status(200).json({ activities });
        // {
        //   "activities": 
        //   [{
        //     "activity_id": 1,
        //     "user_id": 11,
        //     "service_name": "pakalbo",
        //     "details": {
        //       "kalbo": "panot",
        //       "semiKal": "utot"},
        //     "created_at": "2026-06-28T20:19:10.904Z",
        //   },
        //   {
        //     "activity_id": 2,
        //     "user_id": 11,
        //     "service_name": "pakalbo",
        //     "details": {
        //       "kalbo": "panot",
        //       "semiKal": "utot"},
        //     "created_at": "2026-06-28T20:19:22.051Z",
        //   }]
        // }
    } catch (error) {
        res.status(500).json({ error: "error on get your activities" });
    }
}