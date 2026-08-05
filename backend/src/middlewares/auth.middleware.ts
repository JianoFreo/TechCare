import { sql } from "../config/db.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // if your decoded is an object
    // {
    //   user_id: 5,
    //   username: "janno",
    //   role: "admin",
    //   iat: 1782680000,
    //   exp: 1782683600
    // }
    const result = await sql`
      SELECT * from users
      WHERE user_id = ${(decoded as any).user_id}
      `;

    const user = result[0];
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;

    // req.user would be
    // {
    //   user_id: 1,
    //   username: "janno",
    //   full_name: "Janno MM",
    //   email: "janno@email.com",
    //   role: "admin"
    // }
    next();
  } catch(error) {
    res.status(400).json({error: "auth middleware error"});
  }
}

export default authMiddleware;
// export async function authorize(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     let token;

//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer ")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);

//     const result = await sql`
//       SELECT * FROM users
//       WHERE id = ${(decoded as any).id}
//     `;

//     const user = result[0];

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     (req as any).user = user;

//     next();
//   } catch {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
// }
//mongo db

// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// async function authorize(req: Request, res: Response, next: NextFunction) {
//     try {
//         let token
//         if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//             token = req.headers.authorization.split(" ")[1];
//         }
//         if (!token) {
//             return res.status(401).json({ message: "No token provided" });
//         }
//         const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//         const user = await User.findById((decoded as { id: string }).id);
//         if (!user) {
//             return res.status(401).json({ message: "User not found" });
//         }
//         req.user = user;

//         next();
//     } catch (error) {
//         res.status(401).json({ message: "Unauthorized" });
//     }
// }
