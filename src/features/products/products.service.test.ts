import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "./products.service";
import { HttpError } from "../../shared/errors/http-error";
import { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { storeContext } from "../../shared/utils/middlewares/scopedStore";

const PRODUCT_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";
const STORE_UUID = "7ec0bd7f-11c0-43da-975e-2a8ad9ebae0c";

const mockPrisma = {
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  sku: { create: vi.fn() },
  skuAttributeOption: { createMany: vi.fn() },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

describe("ProductService", () => {
  let service: ProductService;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(storeContext, "getStore").mockReturnValue(
      mockPrisma as unknown as PrismaClient,
    );
    service = new ProductService();
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      const products = [
        { id: PRODUCT_UUID, name: "Product Name", storeId: STORE_UUID },
      ];
      mockPrisma.product.findMany.mockResolvedValue(products);

      const result = await service.findAll(STORE_UUID);

      expect(result).toEqual(products);
    });

    it("should return empty array when no products are found", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      const result = await service.findAll(STORE_UUID);

      expect(result).toEqual([]);
    });
  });

  describe("findById", () => {
    it("should return product by given id", async () => {
      const products = { id: PRODUCT_UUID, name: "Test", storeId: STORE_UUID };
      mockPrisma.product.findUnique.mockResolvedValue(products);

      const result = await service.findById(PRODUCT_UUID, STORE_UUID);

      expect(result).toEqual(products);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: PRODUCT_UUID, storeId: STORE_UUID },
      });
    });

    it("should throw 404 when product not found", async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findById("UUID-999", STORE_UUID)).rejects.toThrow(
        HttpError,
      );
      await expect(
        service.findById("UUID-999", STORE_UUID),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Product not found",
      });
    });
  });

  describe("create", () => {
    it("should create new product with default sku when no skus provided", async () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue(
        "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b",
      );

      const productDto = { name: "Test Name", price: 9.99 };
      const productFromCreate = {
        id: PRODUCT_UUID,
        storeId: STORE_UUID,
        ...productDto,
        attributes: [],
      };
      const createdSku = {
        id: "sku-id",
        code: "test-name-6EC0BD7F",
        quantity: 0,
        productId: PRODUCT_UUID,
      };
      const fullProduct = {
        ...productFromCreate,
        skus: [{ ...createdSku, skuAttributeOptions: [] }],
      };

      mockPrisma.product.create.mockResolvedValue(productFromCreate);
      mockPrisma.sku.create.mockResolvedValue(createdSku);
      mockPrisma.product.findUnique.mockResolvedValue(fullProduct);

      const result = await service.create(STORE_UUID, productDto);

      expect(result).toEqual(fullProduct);
      expect(mockPrisma.sku.create).toHaveBeenCalledWith({
        data: { code: "test-name-6EC0BD7F", productId: PRODUCT_UUID },
      });
    });

    it("should create product with attributes and default sku", async () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue(
        "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b",
      );

      const productDto = {
        name: "T-Shirt",
        price: 29.99,
        attributes: [{ name: "Color", options: ["BLUE", "PINK"] }],
      };
      const productFromCreate = {
        id: PRODUCT_UUID,
        storeId: STORE_UUID,
        name: "T-Shirt",
        price: 29.99,
        attributes: [
          {
            id: "attr-id",
            name: "Color",
            options: [
              { id: "opt-blue", value: "BLUE" },
              { id: "opt-pink", value: "PINK" },
            ],
          },
        ],
      };
      const createdSku = {
        id: "sku-id",
        code: "t-shirt-6EC0BD7F",
        quantity: 0,
        productId: PRODUCT_UUID,
      };

      const fullProduct = {
        ...productFromCreate,
        skus: [{ ...createdSku, skuAttributeOptions: [] }],
      };

      mockPrisma.product.create.mockResolvedValue(productFromCreate);
      mockPrisma.sku.create.mockResolvedValue(createdSku);
      mockPrisma.product.findUnique.mockResolvedValue(fullProduct);

      const result = await service.create(STORE_UUID, productDto);

      expect(result).toEqual(fullProduct);
      expect(mockPrisma.sku.create).toHaveBeenCalledWith({
        data: { code: "t-shirt-6EC0BD7F", productId: PRODUCT_UUID },
      });
      expect(mockPrisma.skuAttributeOption.createMany).not.toHaveBeenCalled();
    });

    it("should create product with skus and no attribute options", async () => {
      const productDto = {
        name: "Coffee Mug",
        price: 12.99,
        skus: [{ code: "MUG-001", quantity: 50 }],
      };
      const productFromCreate = {
        id: PRODUCT_UUID,
        storeId: STORE_UUID,
        name: "Coffee Mug",
        price: 12.99,
        attributes: [],
      };
      const createdSku = {
        id: "sku-id",
        code: "MUG-001",
        quantity: 50,
        productId: PRODUCT_UUID,
      };
      const fullProduct = {
        ...productFromCreate,
        skus: [{ ...createdSku, skuAttributeOptions: [] }],
      };

      mockPrisma.product.create.mockResolvedValue(productFromCreate);
      mockPrisma.sku.create.mockResolvedValue(createdSku);
      mockPrisma.product.findUnique.mockResolvedValue(fullProduct);

      const result = await service.create(STORE_UUID, productDto);

      expect(mockPrisma.sku.create).toHaveBeenCalledWith({
        data: { code: "MUG-001", quantity: 50, productId: PRODUCT_UUID },
      });
      expect(mockPrisma.skuAttributeOption.createMany).not.toHaveBeenCalled();
      expect(result).toEqual(fullProduct);
    });

    it("should create product with skus and attribute options", async () => {
      const productDto = {
        name: "T-Shirt",
        price: 29.99,
        attributes: [{ name: "Color", options: ["BLUE"] }],
        skus: [
          {
            code: "TSHIRT-BLUE",
            quantity: 10,
            attributeOptions: { Color: "BLUE" },
          },
        ],
      };
      const productFromCreate = {
        id: PRODUCT_UUID,
        storeId: STORE_UUID,
        name: "T-Shirt",
        price: 29.99,
        attributes: [
          {
            id: "attr-id",
            name: "Color",
            options: [{ id: "opt-blue", value: "BLUE" }],
          },
        ],
      };
      const createdSku = {
        id: "sku-id",
        code: "TSHIRT-BLUE",
        quantity: 10,
        productId: PRODUCT_UUID,
      };
      const fullProduct = {
        ...productFromCreate,
        skus: [
          {
            ...createdSku,
            skuAttributeOptions: [{ attributeOptionId: "opt-blue" }],
          },
        ],
      };

      mockPrisma.product.create.mockResolvedValue(productFromCreate);
      mockPrisma.sku.create.mockResolvedValue(createdSku);
      mockPrisma.skuAttributeOption.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.product.findUnique.mockResolvedValue(fullProduct);

      const result = await service.create(STORE_UUID, productDto);

      expect(mockPrisma.sku.create).toHaveBeenCalledWith({
        data: { code: "TSHIRT-BLUE", quantity: 10, productId: PRODUCT_UUID },
      });
      expect(mockPrisma.skuAttributeOption.createMany).toHaveBeenCalledWith({
        data: [{ skuId: "sku-id", attributeOptionId: "opt-blue" }],
      });
      expect(result).toEqual(fullProduct);
    });
  });

  describe("update", () => {
    it("should update product by id", async () => {
      const product = {
        name: "Updated Name",
        description: "Updated Description",
        price: 9.99,
      };
      mockPrisma.product.update.mockResolvedValue(product);

      const result = await service.update(PRODUCT_UUID, STORE_UUID, product);

      expect(result).toEqual(product);
    });

    it("should throw 404 when product not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.product.update.mockRejectedValue(prismaError);

      await expect(
        service.update("UUID-999", STORE_UUID, { name: "Updated name" }),
      ).rejects.toThrow(HttpError);
    });
  });

  describe("delete", () => {
    it("should delete product by id", async () => {
      const product = {
        name: "Test name",
        description: "Test dscription",
        price: 9.99,
      };
      mockPrisma.product.delete.mockResolvedValue(product);

      const result = await service.delete(PRODUCT_UUID, STORE_UUID);

      expect(result).toEqual(product);
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: PRODUCT_UUID, storeId: STORE_UUID },
      });
    });

    it("should throw 404 when product not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.product.delete.mockRejectedValue(prismaError);

      await expect(service.delete("UUID-999", STORE_UUID)).rejects.toThrow(
        HttpError,
      );
    });
  });
});
