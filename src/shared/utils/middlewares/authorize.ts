import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../errors/http-error";
import { StoreService } from "../../../features/stores/stores.service";

export function authorize(storeService: StoreService, roles: string[]) {
  return async (
    req: Request<{ storeId: string }>,
    _res: Response,
    next: NextFunction,
  ) => {
    const userId = req?.user?.sub;
    const storeId = req.params.storeId;

    if (!userId || !storeId) {
      throw new HttpError(403, "Forbidden");
    }

    const role = await storeService.getUserRole(storeId, userId);
    if (!role || !roles.includes(role)) {
      throw new HttpError(403, "Forbidden");
    }

    next();
  };
}
