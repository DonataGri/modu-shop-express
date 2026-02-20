import type { Request, Response } from "express";
import { AttributeService } from "./attributes.service";

export class AttributeController {
  constructor(private attributeService: AttributeService) {}

  async findAll(req: Request<{ storeId: string }>, res: Response) {
    console.log(req.params, " REQUEST");
    const { storeId } = req.params;
    const attributes = await this.attributeService.findAll(storeId);
    res.json(attributes);
  }

  async create(req: Request<{ storeId: string }>, res: Response) {
    const { storeId } = req.params;
    const attribute = await this.attributeService.create(storeId, req.body);
    res.status(201).json(attribute);
  }

  async update(req: Request<{ attributeId: string }>, res: Response) {
    const { attributeId } = req.params;
    const attribute = await this.attributeService.update(attributeId, req.body);
    res.json(attribute);
  }

  async delete(
    req: Request<{ attributeId: string; storeId: string }>,
    res: Response,
  ) {
    const { attributeId, storeId } = req.params;
    await this.attributeService.delete(attributeId, storeId);
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
