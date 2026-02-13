import { vi, describe, it, expect, beforeEach } from "vitest";
import { StoreService } from "./stores.service";
import { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { HttpError } from "../../shared/errors/http-error";

const TEST_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";

const mockPrisma = {
  store: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  userStore: {
    findUnique: vi.fn(),
  },
};

describe("StoreService", () => {
  let service: StoreService;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    service = new StoreService(mockPrisma as unknown as PrismaClient);
    vi.clearAllMocks();
  });

  describe("findAllByUser", () => {
    it("should return all user stores", async () => {
      const stores = [
        {
          id: TEST_UUID,
          name: "super store",
          description: "we sell stuff",
        },
      ];
      mockPrisma.store.findMany.mockResolvedValue(stores);

      const result = await service.findAllByUser(TEST_UUID);

      expect(result).toEqual(stores);
      expect(mockPrisma.store.findMany).toHaveBeenCalledWith({
        where: { userStores: { some: { userId: TEST_UUID } } },
      });
    });
  });

  describe("findById", () => {
    it("should return store by given id", async () => {
      const store = {
        id: TEST_UUID,
        name: "super store",
        description: "we sell stuff",
      };
      mockPrisma.store.findUnique.mockResolvedValue(store);

      const result = await service.findById(TEST_UUID);

      expect(result).toEqual(store);
      expect(mockPrisma.store.findUnique).toHaveBeenCalledWith({
        where: { id: TEST_UUID },
      });
    });

    it("should throw 404 when store not found", async () => {
      mockPrisma.store.findUnique.mockResolvedValue(null);
      await expect(service.findById("UUID-999")).rejects.toThrow(HttpError);
      await expect(service.findById("UUID-999")).rejects.toMatchObject({
        statusCode: 404,
        message: "Store not found",
      });
    });
  });

  describe("getUserRole", () => {
    it("should return role when user is a store member", async () => {
      mockPrisma.userStore.findUnique.mockResolvedValue({
        userId: TEST_UUID,
        storeId: TEST_UUID,
        role: "OWNER",
      });

      const result = await service.getUserRole(TEST_UUID, TEST_UUID);

      expect(result).toBe("OWNER");
      expect(mockPrisma.userStore.findUnique).toHaveBeenCalledWith({
        where: { userId_storeId: { userId: TEST_UUID, storeId: TEST_UUID } },
      });
    });

    it("should return null when user is not a store member", async () => {
      mockPrisma.userStore.findUnique.mockResolvedValue(null);

      const result = await service.getUserRole(TEST_UUID, TEST_UUID);

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create store with owner membership", async () => {
      const storeDto = { name: "My Store", description: "cool stuff" };
      const created = { id: TEST_UUID, ...storeDto };
      mockPrisma.store.create.mockResolvedValue(created);

      const result = await service.create(TEST_UUID, storeDto);

      expect(result).toEqual(created);
      expect(mockPrisma.store.create).toHaveBeenCalledWith({
        data: {
          ...storeDto,
          userStores: { create: { userId: TEST_UUID, role: "OWNER" } },
        },
      });
    });

    it("should throw 409 when store already exists", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { code: "P2002", clientVersion: "5.0.0" },
      );
      mockPrisma.store.create.mockRejectedValue(prismaError);

      await expect(
        service.create(TEST_UUID, { name: "Duplicate", description: "test" }),
      ).rejects.toThrow(HttpError);
      await expect(
        service.create(TEST_UUID, { name: "Duplicate", description: "test" }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe("update", () => {
    it("should update store by id", async () => {
      const updateDto = { name: "Updated Store", description: "new desc" };
      const updated = { id: TEST_UUID, ...updateDto };
      mockPrisma.store.update.mockResolvedValue(updated);

      const result = await service.update(TEST_UUID, updateDto);

      expect(result).toEqual(updated);
      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: TEST_UUID },
        data: updateDto,
      });
    });

    it("should throw 404 when store not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.store.update.mockRejectedValue(prismaError);

      await expect(
        service.update("UUID-999", { name: "Updated", description: "test" }),
      ).rejects.toThrow(HttpError);
      await expect(
        service.update("UUID-999", { name: "Updated", description: "test" }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("delete", () => {
    it("should delete store by id", async () => {
      const store = { id: TEST_UUID, name: "My Store", description: "stuff" };
      mockPrisma.store.delete.mockResolvedValue(store);

      const result = await service.delete(TEST_UUID);

      expect(result).toEqual(store);
      expect(mockPrisma.store.delete).toHaveBeenCalledWith({
        where: { id: TEST_UUID },
      });
    });

    it("should throw 404 when store not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.store.delete.mockRejectedValue(prismaError);

      await expect(service.delete("UUID-999")).rejects.toThrow(HttpError);
      await expect(service.delete("UUID-999")).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
