import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../../shared/config/env";
import { HttpError } from "../../errors/http-error";
import { logger } from "../../logger";

type JwtUser = { sub: number; email: string; iat: number; exp: number };

export function authenticate() {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new HttpError(401, "Unauthorized");
    }

    const authToken = authHeader.replace("Bearer ", "");

    try {
      const validUser = jwt.verify(authToken, env.JWT_SECRET!);
      req.user = validUser as unknown as JwtUser;
      next();
    } catch (err) {
      logger.error(err);
      throw new HttpError(401, "Unauthorized");
    }
  };
}
