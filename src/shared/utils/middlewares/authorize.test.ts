import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";
import { StoreService } from "../../../features/stores/stores.service";
import { authorize } from "./authorize";

const TEST_USER_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";
const TEST_STORE_UUID = "7ec0bd7f-11c0-43da-975e-2a8ad9ebae0c";

const { storeService } = {
  storeService: {
    getUserRole: vi.fn(),
  } as unknown as Mocked<StoreService>,
};

function createMockReqRes(options: { userId?: string; storeId?: string }) {
  const req = {
    user: options.userId ? { sub: options.userId } : undefined,
    params: { storeId: options.storeId },
  } as unknown as Request<{ storeId: string }>;

  const res = {} as Response;
  const next = vi.fn() as NextFunction;

  return { req, res, next };
}

describe("authorize middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call next when user has allowed role", async () => {
    storeService.getUserRole.mockResolvedValue("OWNER");
    const { req, res, next } = createMockReqRes({
      userId: TEST_USER_UUID,
      storeId: TEST_STORE_UUID,
    });
    const middleware = authorize(storeService, ["OWNER"]);

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should call next and allow multiple roles", async () => {
    storeService.getUserRole.mockResolvedValue("STAFF");
    const { req, res, next } = createMockReqRes({
      userId: TEST_USER_UUID,
      storeId: TEST_STORE_UUID,
    });
    const middleware = authorize(storeService, ["OWNER", "STAFF"]);

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should throw forbidden if user has invalid role", async () => {
    storeService.getUserRole.mockResolvedValue("STAFF");
    const { req, res, next } = createMockReqRes({
      userId: TEST_USER_UUID,
      storeId: TEST_STORE_UUID,
    });
    const middleware = authorize(storeService, ["OWNER"]);

    await expect(middleware(req, res, next)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw forbidden when user is not store member", async () => {
    storeService.getUserRole.mockResolvedValue(null);
    const { req, res, next } = createMockReqRes({
      userId: TEST_USER_UUID,
      storeId: TEST_STORE_UUID,
    });
    const middleware = authorize(storeService, ["OWNER"]);

    await expect(middleware(req, res, next)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw forbidden if userId is missing", async () => {
    storeService.getUserRole.mockResolvedValue("OWNER");
    const { req, res, next } = createMockReqRes({
      storeId: TEST_STORE_UUID,
    });
    const middleware = authorize(storeService, ["OWNER"]);

    await expect(middleware(req, res, next)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw forbidden if storeId is missing", async () => {
    storeService.getUserRole.mockResolvedValue("OWNER");
    const { req, res, next } = createMockReqRes({
      userId: TEST_USER_UUID,
    });
    const middleware = authorize(storeService, ["OWNER"]);

    await expect(middleware(req, res, next)).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(next).not.toHaveBeenCalled();
  });
});
