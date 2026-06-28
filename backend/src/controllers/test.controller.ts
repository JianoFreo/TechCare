// import jwt from "jsonwebtoken";
// import { NextFunction, Request, Response } from "express";

// export async function signIn(req: Request, res: Response) {

//   const user = req.body;
//   const accessToken = jwt.sign(user, process.env.JWT_SECRET!);
//   res.json(accessToken);
// }
// export const getUser = (req: Request, res: Response) => {
//     const users = [
//     {
//         "user": "jim",
//         "title": "i am jim"
//     },
//     {
//         "user": "tim",
//         "title": "i am tim"
//     }
// ]

//     res.json(users.filter((user) => user.user === req.user));
// }
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export async function signIn(req: Request, res: Response, next: NextFunction) {
    const user = req.body
    const accessToken = jwt.sign(user.username, process.env.JWT_SECRET!);
    res.json(accessToken)
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
    
}



// export const getUser = (req: Request, res: Response) => {
//     const users = [
//     {
//         "username": "freo",
//         "title": "i am freo"
//     },
//     {
//         "username": "freo",
//         "title": "i am tim"
//     }
// ]

//     res.json(users.filter((user) => user.username === req.user?.username)); //“If req.user exists, get its username property. If it doesn’t exist, return undefined instead of crashing.”
// }