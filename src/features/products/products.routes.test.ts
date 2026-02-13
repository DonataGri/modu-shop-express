import type { Request, Response, NextFunction } from "express";
import { describe, it, expect, vi, beforeEach, Mocked } from "vitest";
import request from "supertest";
import { HttpError } from "../../shared/errors/http-error";
import app from "../../app";
import type { ProductService } from "./products.service";
import { StoreService } from "../stores/stores.service";

const PRODUCT_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";
const STORE_UUID = "7ec0bd7f-11c0-43da-975e-2a8ad9ebae0c";

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
  const { createStoreRoutes } = await import("../stores/stores.routes");
  const { StoreController } = await import("../stores/stores.controller");
  const { Router } = await import("express");

  const controller = new ProductController(mockService);
  const productRoutes = createProductRoutes(controller);
  const storeController = new StoreController({} as StoreService);

  return {
    storeRoute: createStoreRoutes(
      {} as StoreService,
      storeController,
      productRoutes,
    ),
    authRoute: Router(),
  };
});

vi.mock("../../shared/utils/middlewares/authenticate", () => ({
  authenticate: () => (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

vi.mock("../../shared/utils/middlewares/authorize", () => ({
  authorize: () => (_req: Request, _res: Response, next: NextFunction) =>
    next(),
}));

describe("Product Routes", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  describe("GET stores/:storeId/products", () => {
    it("should return 200 and list of products", async () => {
      const products = [
        {
          id: PRODUCT_UUID,
          storeId: STORE_UUID,
          name: "Test Product",
          description: "",
          price: 9.99,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ];
      mockService.findAll.mockResolvedValue(products);

      const res = await request(app).get(`/stores/${STORE_UUID}/products`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(products)));
    });

    it("should return 200 and empty list if no products found", async () => {
      mockService.findAll.mockResolvedValue([]);

      const res = await request(app).get(`/stores/${STORE_UUID}/products`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("GET stores/:storeId/products/:id", () => {
    it("should return 200 with product when found", async () => {
      const product = {
        id: PRODUCT_UUID,
        storeId: STORE_UUID,
        name: "Test Product",
        description: "",
        price: 9.99,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      mockService.findById.mockResolvedValue(product);

      const res = await request(app).get(`/stores/${STORE_UUID}/products/1`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(product)));
    });

    it("should return 404 when product not found", async () => {
      mockService.findById.mockRejectedValue(
        new HttpError(404, "Product not found"),
      );
      const res = await request(app).get(
        `/stores/${STORE_UUID}/products/UUID-999`,
      );

      expect(res.status).toBe(404);
    });
  });
  describe("POST stores/:storeId/products", () => {
    it("should return 201 when product created", async () => {
      const dto = {
        name: "New Product",
        price: 19.99,
        description: "Nice T-shirt",
      };
      const createdProduct = {
        id: PRODUCT_UUID,
        storeId: STORE_UUID,
        ...dto,
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      mockService.create.mockResolvedValue(createdProduct);

      const res = await request(app)
        .post(`/stores/${STORE_UUID}/products`)
        .send(dto);
      console.log(res.body);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(createdProduct)));
    });

    it("should return 400 when validation fails", async () => {
      const res = await request(app)
        .post(`/stores/${STORE_UUID}/products`)
        .send({ name: "" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when price is negatvie", async () => {
      const res = await request(app)
        .post(`/stores/${STORE_UUID}/products`)
        .send({ price: -9.99 });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT stores/:storeId/products/:id", () => {
    it("should return 200 when product updated", async () => {
      const dto = { name: "Updated Name", price: 9.99 };
      const updatedProduct = {
        id: PRODUCT_UUID,
        storeId: STORE_UUID,
        ...dto,
        description: "Old description",
        updatedAt: new Date(),
        createdAt: new Date(),
      };
      mockService.update.mockResolvedValue(updatedProduct);

      const res = await request(app)
        .put(`/stores/${STORE_UUID}/products/${PRODUCT_UUID}`)
        .send(dto);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(updatedProduct)));
    });

    it("should return 404 when product not found", async () => {
      mockService.update.mockRejectedValue(
        new HttpError(404, "Product not found"),
      );

      const res = await request(app)
        .put(`/stores/${STORE_UUID}/products/UUID-999`)
        .send({ name: "Updated" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /products/:id", () => {
    it("should return 200 when product deleted", async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app).delete(
        `/stores/${STORE_UUID}/products/${PRODUCT_UUID}`,
      );
      expect(res.status).toBe(200);
    });

    it("should return 404 when product not found", async () => {
      mockService.delete.mockRejectedValue(
        new HttpError(404, "Product not found"),
      );

      const res = await request(app).delete(
        `/stores/${STORE_UUID}/products/UUID-999`,
      );

      expect(res.status).toBe(404);
    });
  });
});
