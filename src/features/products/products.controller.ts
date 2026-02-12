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

  async findAll(_: Request, res: Response) {
    const products = await this.productService.findAll();
    res.json(products);
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    const product = await this.productService.findById(req.params.id);
    res.json(product);
  }

  async create(req: Request, res: Response) {
    const product = await this.productService.create(req.body);
    res.status(201).json(product);
  }

  async update(req: Request<{ id: string }>, res: Response) {
    const product = await this.productService.update(req.params.id, req.body);
    res.json(product);
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    await this.productService.delete(req.params.id);
    res.status(200).send();
  }
}
