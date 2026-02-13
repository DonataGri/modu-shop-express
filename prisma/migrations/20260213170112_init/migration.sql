/*
  Warnings:

  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SkuAttributeOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_skuId_fkey";

-- DropForeignKey
ALTER TABLE "SkuAttributeOption" DROP CONSTRAINT "SkuAttributeOption_attributeOptionId_fkey";

-- DropForeignKey
ALTER TABLE "SkuAttributeOption" DROP CONSTRAINT "SkuAttributeOption_skuId_fkey";

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "SkuAttributeOption";

-- CreateTable
CREATE TABLE "sku_attribute_option" (
    "skuId" TEXT NOT NULL,
    "attributeOptionId" TEXT NOT NULL,

    CONSTRAINT "sku_attribute_option_pkey" PRIMARY KEY ("skuId","attributeOptionId")
);

-- CreateTable
CREATE TABLE "order_item" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "order_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_item_orderId_skuId_key" ON "order_item"("orderId", "skuId");

-- AddForeignKey
ALTER TABLE "sku_attribute_option" ADD CONSTRAINT "sku_attribute_option_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sku_attribute_option" ADD CONSTRAINT "sku_attribute_option_attributeOptionId_fkey" FOREIGN KEY ("attributeOptionId") REFERENCES "attribute_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
