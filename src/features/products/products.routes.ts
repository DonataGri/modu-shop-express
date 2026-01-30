// express router setup
import { Router } from "express";
import type { ProductController } from "./products.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { validate, validateId } from "../../shared/utils/middlewares/validate";
import { createProductSchema } from "../../validation/create-product.schema";
import { updateProductSchema } from "../../validation/update-product.schema";

export function createProductRoutes(controller: ProductController) {
  const router = Router();

  router.get(
    "/",
    asyncHandler((req, res) => controller.findAll(req, res)),
  );

  router.get(
    "/:id",
    validateId,
    asyncHandler<{ id: string }>((req, res) => controller.findById(req, res)),
  );

  router.post(
    "/",
    validate(createProductSchema),
    asyncHandler((req, res) => controller.create(req, res)),
  );

  router.put(
    "/:id",
    [validate(updateProductSchema), validateId],
    asyncHandler<{ id: string }>((req, res) => controller.update(req, res)),
  );

  router.delete(
    "/:id",
    validateId,
    asyncHandler<{ id: string }>((req, res) => controller.delete(req, res)),
  );

  return router;
}
