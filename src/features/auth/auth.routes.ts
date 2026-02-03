import { Router } from "express";
import type { AuthController } from "./auth.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { CredentialsDto } from "./dto/credentials.dto";
import { validate } from "../../shared/utils/middlewares/validate";

export function createAuthRoutes(controller: AuthController) {
  const router = Router();

  router.post(
    "/register",
    validate(CredentialsDto),
    asyncHandler((req, res) => controller.register(req, res)),
  );

  router.post(
    "/login",
    validate(CredentialsDto),
    asyncHandler((req, res) => controller.login(req, res)),
  );

  return router;
}
