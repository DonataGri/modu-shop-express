import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { HttpError } from "../../shared/errors/http-error";
import app from "../../app";
import type { ProductService } from "./products.service";

const { mockService } = vi.hoisted(() => ({
  mockService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as ProductService,
}));

vi.mock("../../container", async () => {
  const { ProductController } = await import("./products.controller");
  const { createProductRoutes } = await import("./products.routes");

  const controller = new ProductController(mockService);

  return {
    productService: mockService,
    productRoutes: createProductRoutes(controller),
  };
});

describe("Product Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /products", () => {
    it("should return 200 and list of products", async () => {
      const products = [{ id: 1, name: "Test" }];
      mockService.findAll.mockResolvedValue(products);

      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(products);
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
      const product = { id: 1, name: "Test", price: 9.99 };
      mockService.findById.mockResolvedValue(product);

      const res = await request(app).get("/products/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(product);
    });

    it("should return 404 when product not found", async () => {
      mockService.findById.mockRejectedValue(
        new HttpError(404, "Product not found"),
      );

      const res = await request(app).get("/products/999");

      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid id", async () => {
      const res = await request(app).get("/products/abc");

      expect(res.status).toBe(400);
    });
  });
  describe("POST /products", () => {
    it("should return 201 when product created", async () => {
      const dto = { name: "New Product", price: 19.99 };
      const created = { id: 1, ...dto };
      mockService.create.mockResolvedValue(created);

      const res = await request(app).post("/products").send(dto);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
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
      const updated = { id: 1, ...dto };
      mockService.update.mockResolvedValue(updated);

      const res = await request(app).put("/products/1").send(dto);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
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

    it("should return 404 for invalid id", async () => {
      const res = await request(app)
        .put("/products/abc")
        .send({ name: "Updated" });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /products/:id", () => {
    it("should return 200 when product deleted", async () => {
      mockService.delete.mockResolvedValue({});

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
