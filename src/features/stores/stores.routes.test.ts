import type { Request, Response, NextFunction } from "express";
import { describe, it, expect, vi, beforeEach, Mocked } from "vitest";
import request from "supertest";
import { HttpError } from "../../shared/errors/http-error";
import app from "../../app";
import type { StoreService } from "./stores.service";

const TEST_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";

const { mockService } = vi.hoisted(() => ({
  mockService: {
    findAllByUser: vi.fn(),
    findById: vi.fn(),
    getUserRole: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as Mocked<StoreService>,
}));

vi.mock("../../container", async () => {
  const { StoreController } = await import("./stores.controller");
  const { createStoreRoutes } = await import("./stores.routes");
  const { Router } = await import("express");

  const controller = new StoreController(mockService);

  return {
    storeRoute: createStoreRoutes(controller),
    productRoutes: Router(),
    authRoute: Router(),
  };
});

vi.mock("../../shared/utils/middlewares/authenticate", () => ({
  authenticate:
    () => (req: Request, _res: Response, next: NextFunction) => {
      req.user = { sub: TEST_UUID };
      next();
    },
}));

describe("Store Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("GET /stores", () => {
    it("should return 200 and list of user stores", async () => {
      const stores = [
        { id: TEST_UUID, name: "My Store", description: "cool stuff" },
      ];
      mockService.findAllByUser.mockResolvedValue(stores);

      const res = await request(app).get("/stores");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(stores);
      expect(mockService.findAllByUser).toHaveBeenCalledWith(TEST_UUID);
    });

    it("should return 200 and empty list if no stores found", async () => {
      mockService.findAllByUser.mockResolvedValue([]);

      const res = await request(app).get("/stores");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("GET /stores/:storeId", () => {
    it("should return 200 with store when found", async () => {
      const store = {
        id: TEST_UUID,
        name: "My Store",
        description: "cool stuff",
      };
      mockService.findById.mockResolvedValue(store);

      const res = await request(app).get(`/stores/${TEST_UUID}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(store);
    });

    it("should return 404 when store not found", async () => {
      mockService.findById.mockRejectedValue(
        new HttpError(404, "Store not found"),
      );

      const res = await request(app).get("/stores/UUID-999");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /stores", () => {
    it("should return 201 when store created", async () => {
      const dto = { name: "New Store", description: "we sell stuff" };
      const created = { id: TEST_UUID, ...dto };
      mockService.create.mockResolvedValue(created);

      const res = await request(app).post("/stores").send(dto);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(created);
      expect(mockService.create).toHaveBeenCalledWith(TEST_UUID, dto);
    });

    it("should return 400 when name is missing", async () => {
      const res = await request(app)
        .post("/stores")
        .send({ description: "no name" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when description is missing", async () => {
      const res = await request(app)
        .post("/stores")
        .send({ name: "No Description" });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /stores/:storeId", () => {
    it("should return 200 when store updated", async () => {
      const dto = { name: "Updated Store", description: "updated desc" };
      const updated = { id: TEST_UUID, ...dto };
      mockService.update.mockResolvedValue(updated);

      const res = await request(app).put(`/stores/${TEST_UUID}`).send(dto);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updated);
    });

    it("should return 404 when store not found", async () => {
      mockService.update.mockRejectedValue(
        new HttpError(404, "Store not found"),
      );

      const res = await request(app)
        .put("/stores/UUID-999")
        .send({ name: "Updated", description: "test" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /stores/:storeId", () => {
    it("should return 200 when store deleted", async () => {
      mockService.delete.mockResolvedValue(undefined);

      const res = await request(app).delete(`/stores/${TEST_UUID}`);

      expect(res.status).toBe(200);
    });

    it("should return 404 when store not found", async () => {
      mockService.delete.mockRejectedValue(
        new HttpError(404, "Store not found"),
      );

      const res = await request(app).delete("/stores/UUID-999");

      expect(res.status).toBe(404);
    });
  });
});
