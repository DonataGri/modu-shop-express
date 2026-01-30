import type { Request, Response, NextFunction } from "express";
import { ValidationError, type AnySchema } from "yup";

function formatError(error: ValidationError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  for (const e of error.inner) {
    const key = e.path || "unknown";
    formatted[key] = formatted[key] || [];
    formatted[key].push(e.message);
  }
  return formatted;
}

export function validate(schema: AnySchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json({ errors: formatError(err) });
      }
      next(err);
    }
  };
}

export function validateId(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ errors: { id: ["Invalid ID"] } });
  }
  next();
}
