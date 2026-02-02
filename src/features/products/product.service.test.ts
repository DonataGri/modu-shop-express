import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductService } from "./products.service";
import { HttpError } from "../../shared/errors/http-error";
import { Prisma, PrismaClient } from "../../../generated/prisma/client";

// Mock Prisma client
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
    service = new ProductService(mockPrisma as unknown as PrismaClient);
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      const products = [{ id: 1, name: "Test" }];
      mockPrisma.product.findMany.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
    });
    it("should return emptu array when no products are found", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findUnique", () => {
    it("should return product by given id", async () => {
      const products = [{ id: 1, name: "Test" }];
      mockPrisma.product.findUnique.mockResolvedValue(products);

      const result = await service.findById(1);

      expect(result).toEqual(products);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw 404 when product not found", async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(HttpError);
      await expect(service.findById(999)).rejects.toMatchObject({
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
      };
      const created = { id: 1, ...productDto };

      mockPrisma.product.create.mockResolvedValue(created);

      const result = await service.create(productDto);

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

      const result = await service.update(1, product);

      expect(result).toEqual(product);
    });

    it("should throw 404 when product not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.product.update.mockRejectedValue(prismaError);

      await expect(
        service.update(999, { name: "Updated name" }),
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

      const result = await service.delete(1);

      expect(result).toEqual(product);
      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw 404 when product not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.product.delete.mockRejectedValue(prismaError);

      await expect(service.delete(999)).rejects.toThrow(HttpError);
    });
  });
});
