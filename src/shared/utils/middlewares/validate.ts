import { plainToClass } from "class-transformer";
import {
  validate as classValidate,
  type ValidationError,
} from "class-validator";
import type { Request, Response, NextFunction } from "express";

type ClassType<T> = new (...args: unknown[]) => T;

function formatErrors(errors: ValidationError[]): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const error of errors) {
    if (error.constraints) {
      formatted[error.property] = Object.values(error.constraints);
    }
  }
  return formatted;
}

// The middleware - takes a DTO class, returns middleware

export function validate<T extends object>(dtoClass: ClassType<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      return res.status(400).json({
        message: "Validation failed",
        error: "Request body is required",
      });
    }

    // 1. Transform plain JSON -> class instance
    const dto = plainToClass(dtoClass, req.body);

    // 2. Validate against decorators
    const errors = await classValidate(dto, { whitelist: true });

    // 3. Return 400 if errors
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: formatErrors(errors),
      });
    }

    // 4. Replace body with validated instance, continue
    req.body = dto;
    next();
  };
}

export function validateId() {
  return (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    next();
  };
}
