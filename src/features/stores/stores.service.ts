import { PrismaClient } from "../../../generated/prisma/client";
import { HttpError } from "../../shared/errors/http-error";
import { handlePrismaError } from "../../shared/utils/prisma-error-handler";
import { CreateStoreDto } from "./dto/create-store.dto";
import { UpdateStoreDto } from "./dto/update-store.dto";

export class StoreService {
  constructor(private prisma: PrismaClient) {}

  async findById(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new HttpError(404, "Store not found");
    }

    return store;
  }

  async findAllByUser(userId: string) {
    return await this.prisma.store.findMany({
      where: { userStores: { some: { userId } } },
    });
  }

  async getUserRole(storeId: string, userId: string) {
    const storeMember = await this.prisma.userStore.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    return storeMember?.role ?? null;
  }

  async create(userId: string, createStoreDto: CreateStoreDto) {
    try {
      return await this.prisma.store.create({
        data: {
          ...createStoreDto,
          userStores: {
            create: { userId, role: "OWNER" },
          },
        },
      });
    } catch (err) {
      handlePrismaError(err, "Store");
    }
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    try {
      return await this.prisma.store.update({
        where: { id },
        data: updateStoreDto,
      });
    } catch (err) {
      handlePrismaError(err, "Store");
    }
  }

  async delete(id: string) {
    try {
      return await this.prisma.store.delete({ where: { id } });
    } catch (err) {
      handlePrismaError(err, "Store");
    }
  }
}
