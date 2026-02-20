import { Router } from "express";
import { AttributeController } from "./attributes.controller";
import { asyncHandler } from "../../shared/utils/async-handler";
import { validate } from "../../shared/utils/middlewares/validate";
import { CreateAttributeDto } from "./dto/create-attribute.dto";
import { UpdateAttributeDto } from "./dto/update-attribute.dto";
import { CreateAttributeOptionDto } from "./dto/create-attribute-option.dto";
import { UpdateAttributeOptionDto } from "./dto/update-attribute-option.dto";

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
    validate(CreateAttributeDto),
    asyncHandler<{ storeId: string }>((req, res) =>
      controller.create(req, res),
    ),
  );

  router.put(
    "/:attributeId",
    validate(UpdateAttributeDto),
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
    validate(CreateAttributeOptionDto),
    asyncHandler<{ attributeId: string }>((req, res) =>
      controller.createOption(req, res),
    ),
  );

  router.put(
    "/:attributeId/options/:optionId",
    validate(UpdateAttributeOptionDto),
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
