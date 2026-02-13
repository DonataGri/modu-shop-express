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

  async findAll(storeId: string) {
    return await this.prisma.product.findMany({ where: { storeId } });
  }

  async findById(id: string, storeId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, storeId },
    });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    return product;
  }

  async create(storeId: string, createProductDto: CreateProductDto) {
    try {
      return await this.prisma.product.create({
        data: { ...createProductDto, storeId },
      });
    } catch (err) {
      handlePrismaError(err, "Product");
    }
  }

  async update(
    id: string,
    storeId: string,
    updateProductDto: UpdateProductDto,
  ) {
    try {
      return await this.prisma.product.update({
        where: { id, storeId },
        data: updateProductDto,
      });
    } catch (err) {
      handlePrismaError(err, "Product");
    }
  }

  async delete(id: string, storeId: string) {
    try {
      return await this.prisma.product.delete({ where: { id, storeId } });
    } catch (err) {
      handlePrismaError(err, "Product");
    }
  }
}
