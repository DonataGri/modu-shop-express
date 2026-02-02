// route handlers
/**
 * - Recceives HTTP requests (req,res)
 * - Extracts data from request (params, body)
 * - Calls the service
 * - Sends the response
 */

import type { ProductService } from "./products.service";
import type { Request, Response } from "express";

export class ProductController {
  constructor(private productService: ProductService) {}

  async findAll(_: Request, res: Response) {
    const products = await this.productService.findAll();
    res.json(products);
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id, 10);
    const product = await this.productService.findById(id);
    res.json(product);
  }

  async create(req: Request, res: Response) {
    const product = await this.productService.create(req.body);
    res.status(201).json(product);
  }

  async update(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id, 10);
    const product = await this.productService.update(id, req.body);
    res.json(product);
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id, 10);
    await this.productService.delete(id);
    res.status(200).send();
  }
}
