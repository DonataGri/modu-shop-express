import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { env } from "../config/env";

const adapter = new PrismaPg({ connectionString: env.APP_DATABASE_URL });
export const prisma = new PrismaClient({ adapter, log: ["query"] });

export function forCompany(storeId: string) {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_store_id', ${storeId}, TRUE)`,
              query(args),
            ]);
            console.log(result, "ID");
            return result;
          },
        },
      },
    }),
  );
}
