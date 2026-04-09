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

function generateSkuCode(
  name: string,
  attributeOptions?: Record<string, string>,
) {
  const base = name.toLowerCase().replace(/\s+/g, "-");
  const attrs = attributeOptions
    ? Object.values(attributeOptions).join("-").toLowerCase()
    : "";
  const suffix = crypto.randomUUID().split("-")[0]!.toUpperCase();
  return [base, attrs, suffix].filter(Boolean).join("-");
}

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
    const {
      skus,
      attributes: productAttrbutes,
      ...productData
    } = createProductDto;
    try {
      const results = await this.db.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            ...productData,
            storeId,
            ...(productAttrbutes && {
              attributes: {
                create: productAttrbutes.map((attr) => ({
                  name: attr.name,
                  options: {
                    create: attr.options.map((option) => ({ value: option })),
                  },
                })),
              },
            }),
          },
          include: { attributes: { include: { options: true } } },
        });

        if (skus && skus.length > 0) {
          await Promise.all(
            skus.map(async (sku) => {
              const { attributeOptions, ...skuData } = sku;
              const code =
                skuData.code ??
                generateSkuCode(productData.name, attributeOptions);
              const createdSku = await tx.sku.create({
                data: { ...skuData, code, productId: product.id },
              });

              if (attributeOptions) {
                const links = Object.entries(attributeOptions).map(
                  ([attrName, optionValue]) => {
                    const attribute = product.attributes.find(
                      (a) => a.name === attrName,
                    );
                    const option = attribute?.options.find(
                      (o) => o.value === optionValue,
                    );
                    return {
                      skuId: createdSku.id,
                      attributeOptionId: option!.id,
                    };
                  },
                );
                await tx.skuAttributeOption.createMany({ data: links });
              }
            }),
          );
        } else {
          await tx.sku.create({
            data: {
              code: generateSkuCode(productData.name),
              productId: product.id,
            },
          });
        }

        return tx.product.findUnique({
          where: { id: product.id },
          include: {
            attributes: { include: { options: true } },
            skus: {
              include: {
                skuAttributeOptions: { include: { attributeOption: true } },
              },
            },
          },
        });
      });
      return results;
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
