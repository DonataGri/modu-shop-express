import { Prisma } from "../../../generated/prisma/client";

export function forStore(storeId: string) {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await prisma.$transaction([
              prisma.$executeRaw`SELECT set_config('app.current_store_id', ${storeId}, TRUE)`,
              query(args),
            ]);
            return result;
          },
        },
      },
    }),
  );
}
