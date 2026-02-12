import type { Request, Response } from "express";
import { StoreService } from "./stores.service";
import { HttpError } from "../../shared/errors/http-error";

export class StoreController {
  constructor(private storeService: StoreService) {}

  async findById(req: Request<{ storeId: string }>, res: Response) {
    const store = await this.storeService.findById(req.params?.storeId);
    res.json(store);
  }

  async findAllByUser(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpError(401, "Unauthorized");
    }
    const stores = await this.storeService.findAllByUser(userId);
    res.json(stores);
  }

  async create(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new HttpError(401, "Unauthorized");
    }
    const store = await this.storeService.create(userId, req.body);
    res.status(201).json(store);
  }

  async update(req: Request<{ storeId: string }>, res: Response) {
    const store = await this.storeService.update(req.params.storeId, req.body);
    res.json(store);
  }

  async delete(req: Request<{ storeId: string }>, res: Response) {
    await this.storeService.delete(req.params.storeId);
    res.status(200).send();
  }
}
