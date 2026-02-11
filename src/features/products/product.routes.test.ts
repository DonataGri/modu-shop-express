import type { Request, Response, NextFunction } from "express";
import { describe, it, expect, vi, beforeEach, Mocked } from "vitest";
import request from "supertest";
import { HttpError } from "../../shared/errors/http-error";
import app from "../../app";
import type { ProductService } from "./products.service";

const TEST_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";

const { mockService } = vi.hoisted(() => ({
  mockService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Mocked<ProductService>,
}));

vi.mock("../../container", async () => {
  const { ProductController } = await import("./products.controller");
  const { createProductRoutes } = await import("./products.routes");
  const { Router } = await import("express");

  const controller = new ProductController(mockService);

  return {
    productService: mockService,
    productRoutes: createProductRoutes(controller),
    authRoute: Router(),
  };
});

vi.mock("../../shared/utils/middlewares/authenticate", () => ({
  authenticate: () => (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

describe("Product Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("GET /products", () => {
    it("should return 200 and list of products", async () => {
      const products = [
        {
          id: TEST_UUID,
          name: "Test Product",
          description: "",
          price: 9.99,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      mockService.findAll.mockResolvedValue(products);

      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(products)));
    });

    it("should return 200 and empty list if no products found", async () => {
      mockService.findAll.mockResolvedValue([]);

      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("GET /products/:id", () => {
    it("should return 200 with product when found", async () => {
      const product = {
        id: TEST_UUID,
        name: "Test Product",
        description: "",
        price: 9.99,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      mockService.findById.mockResolvedValue(product);

      const res = await request(app).get("/products/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(product)));
    });

    it("should return 404 when product not found", async () => {
      mockService.findById.mockRejectedValue(
        new HttpError(404, "Product not found"),
      );

      const res = await request(app).get("/products/UUID-999");

      expect(res.status).toBe(404);
    });
  });
  describe("POST /products", () => {
    it("should return 201 when product created", async () => {
      const dto = {
        name: "New Product",
        price: 19.99,
        description: "Nice T-shirt",
      };
      const createdProduct = {
        id: TEST_UUID,
        ...dto,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      mockService.create.mockResolvedValue(createdProduct);

      const res = await request(app).post("/products").send(dto);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(createdProduct)));
    });

    it("should return 400 when validation fails", async () => {
      const res = await request(app).post("/products").send({ name: "" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when price is negatvie", async () => {
      const res = await request(app).post("/products").send({ price: -9.99 });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /products/:id", () => {
    it("should return 200 when product updated", async () => {
      const dto = { name: "Updated Name", price: 9.99 };
      const updatedProduct = {
        id: TEST_UUID,
        ...dto,
        description: "Old description",
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      mockService.update.mockResolvedValue(updatedProduct);

      const res = await request(app).put("/products/1").send(dto);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(updatedProduct)));
    });

    it("should return 404 when product not found", async () => {
      mockService.update.mockRejectedValue(
        new HttpError(404, "Product not found"),
      );

      const res = await request(app)
        .put("/products/999")
        .send({ name: "Updated" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /products/:id", () => {
    it("should return 200 when product deleted", async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app).delete("/products/1");
      expect(res.status).toBe(200);
    });

    it("should return 404 when product not found", async () => {
      mockService.delete.mockRejectedValue(
        new HttpError(404, "Product not found"),
      );

      const res = await request(app).delete("/products/999");

      expect(res.status).toBe(404);
    });
  });
});
