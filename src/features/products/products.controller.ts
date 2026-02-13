// route handlers
/**
 * - Recceives HTTP requests (req,res)
 * - Extracts data from request (params, body)
 * - Calls the service
 * - Sends the response
 */

import type { Request, Response } from "express";
import type { ProductService } from "./products.service";

export class ProductController {
  constructor(private productService: ProductService) {}

  async findAll(req: Request<{ storeId: string }>, res: Response) {
    const { storeId } = req.params;
    const products = await this.productService.findAll(storeId);
    res.json(products);
  }

  async findById(req: Request<{ id: string; storeId: string }>, res: Response) {
    const { id, storeId } = req.params;
    const product = await this.productService.findById(id, storeId);
    res.json(product);
  }

  async create(req: Request<{ storeId: string }>, res: Response) {
    const { storeId } = req.params;
    const product = await this.productService.create(storeId, req.body);
    res.status(201).json(product);
  }

  async update(req: Request<{ id: string; storeId: string }>, res: Response) {
    const { id, storeId } = req.params;
    const product = await this.productService.update(id, storeId, req.body);
    res.json(product);
  }

  async delete(req: Request<{ id: string; storeId: string }>, res: Response) {
    const { id, storeId } = req.params;
    await this.productService.delete(id, storeId);
    res.status(200).send();
  }
}
