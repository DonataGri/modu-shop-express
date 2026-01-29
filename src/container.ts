import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { ProductController } from "./features/products/products.controller";
import { createProductRoutes } from "./features/products/products.routes";
import { ProductService } from "./features/products/products.service";
import { PrismaClient } from "../generated/prisma/client";

console.log(process.env.DATABASE_URL, "URL");
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const productService = new ProductService(prisma);

const productController = new ProductController(productService);
export const productRoutes = createProductRoutes(productController);
