import { type NextFunction, type Request, type Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

export const asyncHandler =
  <P = ParamsDictionary>(
    fn: (
      req: Request<P>,
      res: Response,
      next: NextFunction,
    ) => Promise<void | Response>,
  ) =>
  (req: Request<P>, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
