// business logic
/**
 * - Receives DTOs from the controller
 * - Interacts with Prisma
 * - Retruns data (or throws errors)
 * - Knows nothing about HTTP (no req, res)
 */

import { type PrismaClient } from "../../../generated/prisma/client";
import { HttpError } from "../../shared/errors/http-error";
import { handlePrismaError } from "../../shared/utils/prisma-error-handler";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";

export class ProductService {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findById(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.prisma.product.create({ data: createProductDto });
    } catch (err) {
      handlePrismaError(err, "Product");
    }
  }

  async update(id: number, updateProductDro: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDro,
      });
    } catch (err) {
      handlePrismaError(err, "Product");
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch (err) {
      handlePrismaError(err, "Product");
    }
  }
}
