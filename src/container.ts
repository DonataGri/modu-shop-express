import { env } from "./shared/config/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { ProductController } from "./features/products/products.controller";
import { createProductRoutes } from "./features/products/products.routes";
import { ProductService } from "./features/products/products.service";
import { PrismaClient } from "../generated/prisma/client";
import { AuthController } from "./features/auth/auth.controller";
import { AuthService } from "./features/auth/auth.service";
import { createAuthRoutes } from "./features/auth/auth.routes";

const connectionString = `${env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const productService = new ProductService(prisma);
const authService = new AuthService(prisma);

const productController = new ProductController(productService);
export const productRoutes = createProductRoutes(productController);

const authController = new AuthController(authService);
export const authRoute = createAuthRoutes(authController);
