import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";
import { PrismaClient } from "../../../generated/prisma/client";

const { mockHash, mockCompare, mockSign } = vi.hoisted(() => ({
  mockHash: vi.fn<(data: string, rounds: number) => Promise<string>>(),
  mockCompare: vi.fn<(data: string, encrypted: string) => Promise<boolean>>(),
  mockSign: vi.fn<() => string>(),
}));

const mockPrisma = {
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

vi.mock("bcrypt", () => ({
  default: {
    hash: mockHash,
    compare: mockCompare,
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: { sign: mockSign },
}));

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(mockPrisma as unknown as PrismaClient);
    vi.clearAllMocks();
  });

  it("should return create user and return it", async () => {
    mockHash.mockResolvedValue("hashed_pw");

    const createdUser = {
      id: 9,
      email: "super@email.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.create.mockResolvedValue(createdUser);
    const result = await service.register("super@email.com", "superpassword");

    expect(result).toEqual(createdUser);
  });

  it("should not return passwordHash", async () => {
    mockHash.mockResolvedValue("hashed_pw");
    const createdUser = {
      id: 9,
      email: "super@email.com",
      passwordHash: "hashed_pw",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.create.mockResolvedValue(createdUser);
    const result = await service.register("super@email.com", "superpassword");

    expect(result).not.toHaveProperty("passwordHash");
  });

  it("should find and return user with valid token", async () => {
    const user = {
      id: 9,
      email: "super@email.com",
      passwordHash: "hashed_pw",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockCompare.mockResolvedValue(true);
    mockSign.mockReturnValue("fake-jwt-token");

    const result = await service.login("super@email.com", "superpassword");

    expect(result.user).not.toHaveProperty("passwordHash");
    expect(result.token).equal("fake-jwt-token");
  });

  it("should throw 401 if email is wrong", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login("wrong@email.com", "password")).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("should throw 401 if password is wrong", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 9,
      email: "super@email.com",
      passwordHash: "hashed_pw",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockCompare.mockResolvedValue(false);

    await expect(
      service.login("super@email.com", "wrongpassword"),
    ).rejects.toThrow("Invalid credentials");
  });
});
