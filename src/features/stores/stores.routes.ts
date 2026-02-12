import { Router } from "express";
import { StoreController } from "./stores.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { CreateStoreDto } from "./dto/create-store.dto";
import { validate } from "../../shared/utils/middlewares/validate";
import { UpdateStoreDto } from "./dto/update-store.dto";

export function createStoreRoutes(controller: StoreController) {
  const router = Router();

  router.get(
    "/",
    asyncHandler((req, res) => controller.findAllByUser(req, res)),
  );

  router.post(
    "/",
    validate(CreateStoreDto),
    asyncHandler((req, res) => controller.create(req, res)),
  );

  router.get(
    "/:storeId",
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.findById(req, res),
    ),
  );

  router.put(
    "/:storeId",
    validate(UpdateStoreDto),
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.update(req, res),
    ),
  );

  router.delete(
    "/:storeId",
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.delete(req, res),
    ),
  );

  return router;
}
