import { PrismaClient } from "../../../generated/prisma/client";
import { handlePrismaError } from "../../shared/utils/prisma-error-handler";
import { CreateAttributeOptionDto } from "./dto/create-attribute-option.dto";
import { CreateAttributeDto } from "./dto/create-attribute.dto";
import { UpdateAttributeOptionDto } from "./dto/update-attribute-option.dto";
import { UpdateAttributeDto } from "./dto/update-attribute.dto";

export class AttributeService {
  constructor(private prisma: PrismaClient) {}

  async findAll(productId: string) {
    return await this.prisma.attribute.findMany({
      where: {
        productId,
      },
      include: {
        options: true,
      },
    });
  }

  async create(productId: string, createAttributeDto: CreateAttributeDto) {
    try {
      return await this.prisma.attribute.create({
        data: { ...createAttributeDto, productId },
      });
    } catch (err) {
      handlePrismaError(err, "Attribute");
    }
  }

  async update(id: string, updateAttributeDto: UpdateAttributeDto) {
    try {
      return await this.prisma.attribute.update({
        where: { id },
        data: updateAttributeDto,
      });
    } catch (err) {
      handlePrismaError(err, "Attribute");
    }
  }

  async delete(id: string, productId: string) {
    try {
      return await this.prisma.attribute.delete({ where: { id, productId } });
    } catch (err) {
      handlePrismaError(err, "Attribute");
    }
  }

  async createOption(id: string, optionDto: CreateAttributeOptionDto) {
    try {
      return await this.prisma.attributeOption.create({
        data: { ...optionDto, attributeId: id },
      });
    } catch (err) {
      handlePrismaError(err, "Attribute Option");
    }
  }

  async updateOption(
    id: string,
    updateAttributeOptionDto: UpdateAttributeOptionDto,
  ) {
    try {
      return await this.prisma.attributeOption.update({
        where: { id },
        data: updateAttributeOptionDto,
      });
    } catch (err) {
      handlePrismaError(err, "Attribute Option");
    }
  }

  async deleteOption(id: string) {
    try {
      return await this.prisma.attributeOption.delete({ where: { id } });
    } catch (err) {
      handlePrismaError(err, "Attribute Option");
    }
  }
}
