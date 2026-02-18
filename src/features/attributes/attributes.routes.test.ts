import request from "supertest";
import { describe, expect, it, Mocked, vi } from "vitest";
import { AttributeService } from "./attributes.service";
import { StoreService } from "../stores/stores.service";
import { NextFunction } from "express";
import app from "../../app";

const ATTRIBUTE_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";
const STORE_UUID = "7ec0bd7f-11c0-43da-975e-2a8ad9ebae0c";

const { mockService } = vi.hoisted(() => ({
  mockService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Mocked<AttributeService>,
}));

vi.mock("../../container", async () => {
  const { StoreController } = await import("../stores/stores.controller");
  const { AttributeController } = await import("./attributes.controller");
  const { createStoreRoutes } = await import("../stores/stores.routes");
  const { createAttributeRoutes } = await import("./attributes.routes");

  const { Router } = await import("express");

  const controller = new AttributeController(mockService);
  const attributeRoutes = createAttributeRoutes(controller);
  const storeController = new StoreController({} as StoreService);

  return {
    storeRoute: createStoreRoutes(
      {} as StoreService,
      storeController,
      attributeRoutes,
      Router(),
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

describe("GET stores/:storeId/attributes", () => {
  it("should return 200 and list of attributes with options", async () => {
    const attributes = [
      {
        id: ATTRIBUTE_UUID,
        name: "Color",
        storeId: STORE_UUID,
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

    const res = await request(app).get(`/stores/${STORE_UUID}/attributes`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(JSON.parse(JSON.stringify(attributes)));
  });
});
