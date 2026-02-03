import type { User as PrismaUser } from "../../../generated/prisma/client";

export type User = PrismaUser;
export type UserWithoutPassword = Omit<User, "passwordHash">;
