import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "./products.service";
import { HttpError } from "../../shared/errors/http-error";
import { Prisma, PrismaClient } from "../../../generated/prisma/client";

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
};

describe("ProductService", () => {
  let service: ProductService;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    service = new ProductService(mockPrisma as unknown as PrismaClient);
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

    it("should return emptu array when no products are found", async () => {
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
    it("should create new product", async () => {
      const productDto = {
        name: "Test Name",
        price: 9.99,
        storeId: STORE_UUID,
      };
      const created = { id: PRODUCT_UUID, ...productDto };

      mockPrisma.product.create.mockResolvedValue(created);

      const result = await service.create(STORE_UUID, productDto);

      expect(result).toEqual(created);
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: productDto,
      });
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
