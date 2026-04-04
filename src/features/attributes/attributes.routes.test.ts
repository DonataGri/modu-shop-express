import request from "supertest";
import { Response, Request, NextFunction } from "express";
import { describe, expect, it, Mocked, vi, beforeEach } from "vitest";
import { AttributeService } from "./attributes.service";
import { HttpError } from "../../shared/errors/http-error";
import app from "../../app";
import { ProductService } from "../products/products.service";
import { StoreService } from "../stores/stores.service";

const ATTRIBUTE_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";
const STORE_UUID = "5ec0bd7f-11c0-43da-975e-2a8ad9ebae0a";
const PRODUCT_UUID = "7ec0bd7f-11c0-43da-975e-2a8ad9ebae0c";
const OPTION_UUID = "8ec0bd7f-11c0-43da-975e-2a8ad9ebae0d";

const BASE_URL = `/stores/${STORE_UUID}/products/${PRODUCT_UUID}/attributes`;

const { mockService } = vi.hoisted(() => ({
  mockService: {
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createOption: vi.fn(),
    updateOption: vi.fn(),
    deleteOption: vi.fn(),
  } as unknown as Mocked<AttributeService>,
}));

vi.mock("../../container", async () => {
  const { Router } = await import("express");
  const { ProductController } = await import("../products/products.controller");
  const { AttributeController } = await import("./attributes.controller");
  const { StoreController } = await import("../stores/stores.controller");
  const { createProductRoutes } = await import("../products/products.routes");
  const { createAttributeRoutes } = await import("./attributes.routes");
  const { createStoreRoutes } = await import("../stores/stores.routes");

  const attributeController = new AttributeController(mockService);
  const attributeRoutes = createAttributeRoutes(attributeController);
  const productController = new ProductController({} as ProductService);
  const productRoutes = createProductRoutes(productController, attributeRoutes);
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

vi.mock("../../shared/utils/middlewares/scopedStore", () => ({
  withTenant: (_req: Request, _res: Response, next: NextFunction) => next(),
  storeContext: { getStore: vi.fn(), run: vi.fn() },
}));

describe("Attribute Routes", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  describe("GET /stores/:storeId/products/:productId/attributes", () => {
    it("should return 200 and list of attributes with options", async () => {
      const attributes = [
        {
          id: ATTRIBUTE_UUID,
          name: "Color",
          productId: PRODUCT_UUID,
          updatedAt: new Date(),
          createdAt: new Date(),
          options: [
            {
              id: "1111_aaaa_2222_bbbb",
              attributeId: ATTRIBUTE_UUID,
              value: "Black",
              updatedAt: new Date(),
              createdAt: new Date(),
            },
            {
              id: "2222_bbbb_3333_cccc",
              attributeId: ATTRIBUTE_UUID,
              value: "White",
              updatedAt: new Date(),
              createdAt: new Date(),
            },
          ],
        },
      ];

      mockService.findAll.mockResolvedValue(attributes);

      const res = await request(app).get(BASE_URL);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(attributes)));
    });

    it("should return 200 and empty list if no attributes found", async () => {
      mockService.findAll.mockResolvedValue([]);

      const res = await request(app).get(BASE_URL);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("POST /stores/:storeId/products/:productId/attributes", () => {
    it("should return 201 when attribute created", async () => {
      const dto = { name: "Color", options: ["Red", "Blue"] };
      const createdAttribute = {
        id: ATTRIBUTE_UUID,
        name: "Color",
        productId: PRODUCT_UUID,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      mockService.create.mockResolvedValue(createdAttribute);

      const res = await request(app).post(BASE_URL).send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(createdAttribute)));
    });

    it("should return 409 when attribute name already exists", async () => {
      mockService.create.mockRejectedValue(
        new HttpError(409, "Attribute already exists"),
      );

      const res = await request(app).post(BASE_URL).send({ name: "Color", options: ["Red"] });

      expect(res.status).toBe(409);
    });

    it("should return 400 when name is empty", async () => {
      const res = await request(app).post(BASE_URL).send({ name: "" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when name is missing", async () => {
      const res = await request(app).post(BASE_URL).send({});
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /stores/:storeId/products/:productId/attributes/:attributeId", () => {
    it("should return 200 when attribute updated", async () => {
      const dto = { name: "Size" };
      const updatedAttribute = {
        id: ATTRIBUTE_UUID,
        name: "Size",
        productId: PRODUCT_UUID,
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      mockService.update.mockResolvedValue(updatedAttribute);

      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}`)
        .send(dto);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(updatedAttribute)));
    });

    it("should return 409 when attribute name already exists", async () => {
      mockService.update.mockRejectedValue(
        new HttpError(409, "Attribute already exists"),
      );

      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}`)
        .send({ name: "Color" });

      expect(res.status).toBe(409);
    });

    it("should return 404 when attribute not found", async () => {
      mockService.update.mockRejectedValue(
        new HttpError(404, "Attribute not found"),
      );

      const res = await request(app)
        .put(`${BASE_URL}/UUID-999`)
        .send({ name: "Updated" });

      expect(res.status).toBe(404);
    });

    it("should return 400 when name is empty", async () => {
      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}`)
        .send({ name: "" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when name is missing", async () => {
      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /stores/:storeId/products/:productId/attributes/:attributeId", () => {
    it("should return 200 when attribute deleted", async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app).delete(`${BASE_URL}/${ATTRIBUTE_UUID}`);

      expect(res.status).toBe(200);
    });

    it("should return 404 when attribute not found", async () => {
      mockService.delete.mockRejectedValue(
        new HttpError(404, "Attribute not found"),
      );

      const res = await request(app).delete(`${BASE_URL}/UUID-999`);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /stores/:storeId/products/:productId/attributes/:attributeId/options", () => {
    it("should return 201 when option created", async () => {
      const dto = { value: "Black" };
      const createdOption = {
        id: OPTION_UUID,
        attributeId: ATTRIBUTE_UUID,
        value: "Black",
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      mockService.createOption.mockResolvedValue(createdOption);

      const res = await request(app)
        .post(`${BASE_URL}/${ATTRIBUTE_UUID}/options`)
        .send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(createdOption)));
    });

    it("should return 409 when option value already exists", async () => {
      mockService.createOption.mockRejectedValue(
        new HttpError(409, "Attribute Option already exists"),
      );

      const res = await request(app)
        .post(`${BASE_URL}/${ATTRIBUTE_UUID}/options`)
        .send({ value: "Black" });

      expect(res.status).toBe(409);
    });

    it("should return 400 when value is empty", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/${ATTRIBUTE_UUID}/options`)
        .send({ value: "" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when value is missing", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/${ATTRIBUTE_UUID}/options`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /stores/:storeId/products/:productId/attributes/:attributeId/options/:optionId", () => {
    it("should return 200 when option updated", async () => {
      const dto = { value: "Dark Black" };
      const updatedOption = {
        id: OPTION_UUID,
        attributeId: ATTRIBUTE_UUID,
        value: "Dark Black",
        updatedAt: new Date(),
        createdAt: new Date(),
      };

      mockService.updateOption.mockResolvedValue(updatedOption);

      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}/options/${OPTION_UUID}`)
        .send(dto);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(updatedOption)));
    });

    it("should return 409 when option value already exists", async () => {
      mockService.updateOption.mockRejectedValue(
        new HttpError(409, "Attribute Option already exists"),
      );

      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}/options/${OPTION_UUID}`)
        .send({ value: "Black" });

      expect(res.status).toBe(409);
    });

    it("should return 404 when option not found", async () => {
      mockService.updateOption.mockRejectedValue(
        new HttpError(404, "Attribute Option not found"),
      );

      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}/options/UUID-999`)
        .send({ value: "Updated" });

      expect(res.status).toBe(404);
    });

    it("should return 400 when value is empty", async () => {
      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}/options/UUID-999`)
        .send({ value: "" });
      expect(res.status).toBe(400);
    });

    it("should return 400 when value is missing", async () => {
      const res = await request(app)
        .put(`${BASE_URL}/${ATTRIBUTE_UUID}/options/UUID-999`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /stores/:storeId/products/:productId/attributes/:attributeId/options/:optionId", () => {
    it("should return 200 when option deleted", async () => {
      mockService.deleteOption.mockResolvedValue(undefined);

      const res = await request(app).delete(
        `${BASE_URL}/${ATTRIBUTE_UUID}/options/${OPTION_UUID}`,
      );

      expect(res.status).toBe(200);
    });

    it("should return 404 when option not found", async () => {
      mockService.deleteOption.mockRejectedValue(
        new HttpError(404, "Attribute Option not found"),
      );

      const res = await request(app).delete(
        `${BASE_URL}/${ATTRIBUTE_UUID}/options/UUID-999`,
      );

      expect(res.status).toBe(404);
    });
  });
});
