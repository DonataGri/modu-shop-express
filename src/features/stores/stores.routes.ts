import { Router } from "express";
import { StoreController } from "./stores.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { CreateStoreDto } from "./dto/create-store.dto";
import { validate } from "../../shared/utils/middlewares/validate";
import { UpdateStoreDto } from "./dto/update-store.dto";
import { authorize } from "../../shared/utils/middlewares/authorize";
import { StoreService } from "./stores.service";

export function createStoreRoutes(
  storeService: StoreService,
  controller: StoreController,
) {
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
    [validate(UpdateStoreDto), authorize(storeService, ["OWNER"])],
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.update(req, res),
    ),
  );

  router.delete(
    "/:storeId",
    authorize(storeService, ["OWNER"]),
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.delete(req, res),
    ),
  );

  return router;
}
