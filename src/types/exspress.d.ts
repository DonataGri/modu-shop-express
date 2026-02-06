import "express";

declare module "express" {
  interface Request {
    user?: { sub: number; email: string; iat: number; exp: number };
  }
}
