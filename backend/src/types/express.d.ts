import { JwtPayload } from "jsonwebtoken";

interface JwtUser extends JwtPayload {
  user_id: number;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};