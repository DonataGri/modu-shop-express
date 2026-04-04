// business logic
/**
 * - Receives DTOs from the controller
 * - Interacts with Prisma
 * - Retruns data (or throws errors)
 * - Knows nothing about HTTP (no req, res)
 */

import { HttpError } from "../../shared/errors/http-error";
import { storeContext } from "../../shared/utils/middlewares/scopedStore";
import { handlePrismaError } from "../../shared/utils/prisma-error-handler";
import type { CreateProductDto } from "./dto/create-product.dto";
import type { UpdateProductDto } from "./dto/update-product.dto";

export class ProductService {
  private get db() {
    return storeContext.getStore()!;
  }

  async findAll(storeId: string) {
    return await this.db.product.findMany({ where: { storeId } });
  }

  async findById(id: string, storeId: string) {
    const product = await this.db.product.findUnique({
      where: { id, storeId },
    });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    return product;
  }

  async create(storeId: string, createProductDto: CreateProductDto) {
    const { _skus, _attributes, ...productData } = createProductDto;
    try {
      return await this.db.product.create({
        data: { ...productData, storeId },
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
      return await this.db.product.update({
        where: { id, storeId },
        data: updateProductDto,
      });
    } catch (err) {
      handlePrismaError(err, "Product");
    }
  }

  async delete(id: string, storeId: string) {
    try {
      return await this.db.product.delete({ where: { id, storeId } });
    } catch (err) {
      handlePrismaError(err, "Product");
    }
  }
}
