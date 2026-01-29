import { Prisma } from "../../../generated/prisma/client";
import { HttpError } from "../errors/http-error";

export function handlePrismaError(err: unknown, entityName = "Resource"): void {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      throw new HttpError(404, `${entityName} not found`);
    }
    if (err.code === "P2002") {
      throw new HttpError(409, `${entityName} already exists`);
    }
  }

  throw err;
}
