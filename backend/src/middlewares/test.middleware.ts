// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// export async function authenticateToken(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   const header = req.headers.authorization;
//   const token = header && header.split(" ")[1];
//   // header && means if there is a header then split it otherwise it will be undefined and the token will be undefined
//   // the value is [Bearer, user_token] adter split so we say [1] to get the second value whihs is the token
//   if (token == null) return res.sendStatus(401); // if there is no token then return 40
//   jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
//     if (err) return res.sendStatus(403); // if the token is invalid then return 403
//     req.user = decoded;
//     console.log(req.user)
//     res.json(req.user)
//   next();
//   });

// }
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization; //req.headers.authorization = "Bearer abc123" // the iniital return o fthe token doesnt have bearer prefix but if extracted from the header it has it
  const token = header && header.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
}
