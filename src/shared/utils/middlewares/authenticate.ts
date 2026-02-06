import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { HttpError } from "../../errors/http-error";

type JwtUser = { sub: number; email: string; iat: number; exp: number };

export function authenticate() {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpError(401, "Unauthorized");
    }

    const authToken = authHeader.replace("Bearer ", "");

    try {
      const validUser = jwt.verify(authToken, process.env.JWT_SECRET!);
      req.user = validUser as unknown as JwtUser;
      next();
    } catch (err) {
      console.error(err);
      throw new HttpError(401, "Unauthorized");
    }
  };
}
