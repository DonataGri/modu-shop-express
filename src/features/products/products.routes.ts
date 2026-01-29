// express router setup
import { Router } from "express";
import type { ProductController } from "./products.controller";
import { asyncHandler } from "../../shared/utils/async-hanlder";

export function createProductRoutes(controller: ProductController) {
  const router = Router();

  router.get(
    "/",
    asyncHandler((req, res) => controller.findAll(req, res)),
  );

  router.get(
    "/:id",
    asyncHandler<{ id: string }>((req, res) => controller.findById(req, res)),
  );

  router.post(
    "/",
    asyncHandler((req, res) => controller.create(req, res)),
  );

  router.put(
    "/:id",
    asyncHandler<{ id: string }>((req, res) => controller.update(req, res)),
  );

  router.delete(
    "/:id",
    asyncHandler<{ id: string }>((req, res) => controller.delete(req, res)),
  );

  return router;
}
