import { describe, expect, it, Mocked, vi, beforeEach } from "vitest";
import request from "supertest";
import { AuthService } from "./auth.service";
import app from "../../app";
import { HttpError } from "../../shared/errors/http-error";

const TEST_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";

const { mockService } = vi.hoisted(() => ({
  mockService: {
    register: vi.fn(),
    login: vi.fn(),
  } as unknown as Mocked<AuthService>,
}));

vi.mock("../../container", async () => {
  const { AuthController } = await import("./auth.controller");
  const { createAuthRoutes } = await import("./auth.routes");
  const { Router } = await import("express");

  const controller = new AuthController(mockService);

  return {
    productRoutes: Router(),
    authRoute: createAuthRoutes(controller),
    storeRoute: Router(),
  };
});

describe("Auth Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("POST /register", () => {
    it("should return 201 and return created user", async () => {
      const credentials = { email: "super@mail.com", password: "superpass" };
      const createdUser = {
        id: TEST_UUID,
        email: "super@mail.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.register.mockResolvedValue(createdUser);

      const res = await request(app).post("/auth/register").send(credentials);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(JSON.parse(JSON.stringify(createdUser)));
    });
    it("should return 400 when validation fails", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "badmail" });

      expect(res.status).toBe(400);
    });
  });
  describe("POST /login", () => {
    it("should return 200 with token", async () => {
      mockService.login.mockResolvedValue({
        user: {
          id: TEST_UUID,
          email: "super@email.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        token: "fake-jwt-token",
      });

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "super@email.com", password: "superpass" });
      expect(res.status).toBe(200);
      expect(res.body.token).toBe("fake-jwt-token");
    });

    it("should return 400 when validation fails", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "badmail" });

      expect(res.status).toBe(400);
    });

    it("should return 401 with invalid credentials", async () => {
      mockService.login.mockRejectedValue(
        new HttpError(401, "Invalid credentials"),
      );

      const res = await request(app)
        .post("/auth/login")
        .send({ email: "super@mail.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
    });
  });
});
