/*
  Warnings:

  - A unique constraint covering the columns `[productId,productSizeId,productColorId]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productId` to the `inventory` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "inventory_productSizeId_productColorId_key";

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "productId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "basePrice" SET DEFAULT 0,
ALTER COLUMN "isActive" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "inventory_productId_idx" ON "inventory"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_productId_productSizeId_productColorId_key" ON "inventory"("productId", "productSizeId", "productColorId");

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
