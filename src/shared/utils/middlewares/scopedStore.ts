import { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "async_hooks";
import { forCompany, prisma } from "../../prisma/client";
import { PrismaClient } from "../../../../generated/prisma/client";

type TenantPrismaClient = ReturnType<typeof forTenant>;

function forTenant(storeId: string) {
  return prisma.$extends(forCompany(storeId));
}

const tenantClients = new Map<string, TenantPrismaClient>();

const getTenantClient = (storeId: string) => {
  if (!tenantClients.has(storeId)) {
    tenantClients.set(storeId, forTenant(storeId));
  }
  return tenantClients.get(storeId)!;
};

export const storeContext = new AsyncLocalStorage<PrismaClient>();

// middleware
export const withTenant = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const db = getTenantClient(req.params.storeId); // cached
  storeContext.run(db, next);
};
