import type { Request, Response } from "express";
import { AttributeService } from "./attributes.service";

export class AttributeController {
  constructor(private attributeService: AttributeService) {}

  async findAll(req: Request<{ productId: string }>, res: Response) {
    const { productId } = req.params;
    const attributes = await this.attributeService.findAll(productId);
    res.json(attributes);
  }

  async create(req: Request<{ productId: string }>, res: Response) {
    const { productId } = req.params;
    const attribute = await this.attributeService.create(productId, req.body);
    res.status(201).json(attribute);
  }

  async update(req: Request<{ attributeId: string }>, res: Response) {
    const { attributeId } = req.params;
    const attribute = await this.attributeService.update(attributeId, req.body);
    res.json(attribute);
  }

  async delete(
    req: Request<{ attributeId: string; productId: string }>,
    res: Response,
  ) {
    const { attributeId, productId } = req.params;
    await this.attributeService.delete(attributeId, productId);
    res.status(200).send();
  }

  async createOption(req: Request<{ attributeId: string }>, res: Response) {
    const { attributeId } = req.params;
    const attribute = await this.attributeService.createOption(
      attributeId,
      req.body,
    );
    res.status(201).json(attribute);
  }

  async updateOption(req: Request<{ optionId: string }>, res: Response) {
    const { optionId } = req.params;
    const attribute = await this.attributeService.updateOption(
      optionId,
      req.body,
    );
    res.json(attribute);
  }

  async deleteOption(req: Request<{ optionId: string }>, res: Response) {
    const { optionId } = req.params;
    await this.attributeService.deleteOption(optionId);
    res.status(200).send();
  }
}
