-- DropForeignKey
ALTER TABLE "UserStore" DROP CONSTRAINT "UserStore_storeId_fkey";

-- AddForeignKey
ALTER TABLE "UserStore" ADD CONSTRAINT "UserStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
