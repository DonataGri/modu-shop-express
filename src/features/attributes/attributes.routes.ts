import { Router } from "express";
import { AttributeController } from "./attributes.controller";
import { asyncHandler } from "../../shared/utils/async-handler";

export function createAttributeRoutes(controller: AttributeController) {
  const router = Router({ mergeParams: true });

  router.get(
    "/",
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.findAll(req, res),
    ),
  );

  router.post(
    "/",
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.create(req, res),
    ),
  );

  router.put(
    "/:attributeId",
    asyncHandler<{ attributeId: string }>((req, res) =>
      controller.update(req, res),
    ),
  );

  router.delete(
    "/:attributeId",
    asyncHandler<{ attributeId: string; storeId: string }>((req, res) =>
      controller.delete(req, res),
    ),
  );

  router.post(
    "/:attributeId/options",
    asyncHandler<{ attributeId: string }>((req, res) =>
      controller.createOption(req, res),
    ),
  );

  router.put(
    "/:attributeId/options/:optionId",
    asyncHandler<{ optionId: string }>((req, res) =>
      controller.updateOption(req, res),
    ),
  );

  router.delete(
    "/:attributeId/options/:optionId",
    asyncHandler<{ optionId: string }>((req, res) =>
      controller.deleteOption(req, res),
    ),
  );

  return router;
}
