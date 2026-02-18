import { beforeEach, vi, describe, it, expect } from "vitest";
import { AttributeService } from "./attributes.service";
import { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { HttpError } from "../../shared/errors/http-error";

const ATTRIBUTE_UUID = "6ec0bd7f-11c0-43da-975e-2a8ad9ebae0b";
const STORE_UUID = "7ec0bd7f-11c0-43da-975e-2a8ad9ebae0c";

const OPTION_UUID = "8ec0bd7f-11c0-43da-975e-2a8ad9ebae0d";

const mockPrisma = {
  attribute: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  attributeOption: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe("AttributeSerivce", () => {
  let service: AttributeService;

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    service = new AttributeService(mockPrisma as unknown as PrismaClient);
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all attributes with options", async () => {
      const attributes = [
        {
          id: ATTRIBUTE_UUID,
          name: "Color",
          storeId: STORE_UUID,
          options: [
            { id: "1111_aaaa_2222_bbbb", value: "Black" },
            { id: "2222_bbbb_3333_cccc", value: "White" },
          ],
        },
      ];

      mockPrisma.attribute.findMany.mockResolvedValue(attributes);

      const result = await service.findAll(STORE_UUID);

      expect(result).toEqual(attributes);
      expect(mockPrisma.attribute.findMany).toHaveBeenCalledWith({
        where: { storeId: STORE_UUID },
        include: { options: true },
      });
    });

    it("should return empty array when no attributes are found", async () => {
      mockPrisma.attribute.findMany.mockResolvedValue([]);

      const result = await service.findAll(STORE_UUID);

      expect(result).toEqual([]);
    });
  });

  describe("createAttribute", () => {
    it("should create new attribute", async () => {
      const attributeDto = {
        name: "Size",
      };
      const created = {
        id: ATTRIBUTE_UUID,
        storeId: STORE_UUID,
        ...attributeDto,
      };

      mockPrisma.attribute.create.mockResolvedValue(created);

      const result = await service.create(STORE_UUID, attributeDto);
      expect(result).toEqual(created);
    });
  });

  // does it make sense to update attribute name, but not options??
  describe("updateAttribute", () => {
    it("should update attribute by id", async () => {
      const updateAttributeDto = {
        name: "Color",
      };

      mockPrisma.attribute.update.mockResolvedValue(updateAttributeDto);

      const result = await service.update(ATTRIBUTE_UUID, updateAttributeDto);

      expect(result).toEqual(updateAttributeDto);
    });

    it("should throw 404 when attribute not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.attribute.update.mockRejectedValue(prismaError);

      await expect(
        service.update("UUID-999", { name: "Updated name" }),
      ).rejects.toThrow(HttpError);
    });

    it("should throw 409 when attribute name already exists", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { code: "P2002", clientVersion: "5.0.0" },
      );
      mockPrisma.attribute.update.mockRejectedValue(prismaError);

      await expect(
        service.update(ATTRIBUTE_UUID, { name: "Color" }),
      ).rejects.toThrow(HttpError);
    });
  });

  describe("deleteAttribute", () => {
    it("should delete attribute by id", async () => {
      mockPrisma.attribute.delete.mockResolvedValue(undefined);

      await service.delete(ATTRIBUTE_UUID, STORE_UUID);

      expect(mockPrisma.attribute.delete).toHaveBeenCalledWith({
        where: { id: ATTRIBUTE_UUID, storeId: STORE_UUID },
      });
    });

    it("should throw 404 when attribute not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.attribute.delete.mockRejectedValue(prismaError);

      await expect(service.delete("UUID-999", STORE_UUID)).rejects.toThrow(
        HttpError,
      );
    });
  });

  describe("createOption", () => {
    it("should create new attribute option", async () => {
      const optionDto = { value: "Black" };
      const created = {
        id: OPTION_UUID,
        attributeId: ATTRIBUTE_UUID,
        ...optionDto,
      };

      mockPrisma.attributeOption.create.mockResolvedValue(created);

      const result = await service.createOption(ATTRIBUTE_UUID, optionDto);
      expect(result).toEqual(created);
      expect(mockPrisma.attributeOption.create).toHaveBeenCalledWith({
        data: { value: "Black", attributeId: ATTRIBUTE_UUID },
      });
    });

    it("should throw 409 when option value already exists", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { code: "P2002", clientVersion: "5.0.0" },
      );
      mockPrisma.attributeOption.create.mockRejectedValue(prismaError);

      await expect(
        service.createOption(ATTRIBUTE_UUID, { value: "Black" }),
      ).rejects.toThrow(HttpError);
    });
  });

  describe("updateOption", () => {
    it("should update attribute option by id", async () => {
      const updateDto = { value: "Dark Black" };
      const updated = {
        id: OPTION_UUID,
        attributeId: ATTRIBUTE_UUID,
        ...updateDto,
      };

      mockPrisma.attributeOption.update.mockResolvedValue(updated);

      const result = await service.updateOption(OPTION_UUID, updateDto);
      expect(result).toEqual(updated);
    });

    it("should throw 404 when option not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.attributeOption.update.mockRejectedValue(prismaError);

      await expect(
        service.updateOption("UUID-999", { value: "Updated" }),
      ).rejects.toThrow(HttpError);
    });
  });

  describe("deleteOption", () => {
    it("should delete attribute option by id", async () => {
      mockPrisma.attributeOption.delete.mockResolvedValue(undefined);

      await service.deleteOption(OPTION_UUID);

      expect(mockPrisma.attributeOption.delete).toHaveBeenCalledWith({
        where: { id: OPTION_UUID },
      });
    });

    it("should throw 404 when option not found", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record not found",
        { code: "P2025", clientVersion: "5.0.0" },
      );
      mockPrisma.attributeOption.delete.mockRejectedValue(prismaError);

      await expect(service.deleteOption("UUID-999")).rejects.toThrow(HttpError);
    });
  });
});
