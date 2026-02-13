// express router setup
import { Router } from "express";
import type { ProductController } from "./products.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { CreateProductDto } from "./dto/create-product.dto";
import { validate } from "../../shared/utils/middlewares/validate";
import { UpdateProductDto } from "./dto/update-product.dto";

export function createProductRoutes(controller: ProductController) {
  const router = Router({ mergeParams: true });

  router.get(
    "/",
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.findAll(req, res),
    ),
  );

  router.get(
    "/:id",
    asyncHandler<{ id: string; storeId: string }>((req, res) =>
      controller.findById(req, res),
    ),
  );

  router.post(
    "/",
    validate(CreateProductDto),
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.create(req, res),
    ),
  );

  router.put(
    "/:id",
    validate(UpdateProductDto),
    asyncHandler<{ id: string; storeId: string }>((req, res) =>
      controller.update(req, res),
    ),
  );

  router.delete(
    "/:id",
    asyncHandler<{ id: string; storeId: string }>((req, res) =>
      controller.delete(req, res),
    ),
  );

  return router;
}
