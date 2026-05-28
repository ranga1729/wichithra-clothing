/*
  Warnings:

  - You are about to drop the column `costPrice` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `productColorId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `productSizeId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `mainColorId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `category_designs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_colors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_sizes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[variantId]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `variantId` to the `inventory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "category_designs" DROP CONSTRAINT "category_designs_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "category_designs" DROP CONSTRAINT "category_designs_designId_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_productColorId_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_productSizeId_fkey";

-- DropForeignKey
ALTER TABLE "product_colors" DROP CONSTRAINT "product_colors_colorId_fkey";

-- DropForeignKey
ALTER TABLE "product_colors" DROP CONSTRAINT "product_colors_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_sizes" DROP CONSTRAINT "product_sizes_productId_fkey";

-- DropForeignKey
ALTER TABLE "product_sizes" DROP CONSTRAINT "product_sizes_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_mainColorId_fkey";

-- DropIndex
DROP INDEX "inventory_productId_idx";

-- DropIndex
DROP INDEX "inventory_productSizeId_productColorId_key";

-- DropIndex
DROP INDEX "inventory_sku_idx";

-- DropIndex
DROP INDEX "inventory_sku_key";

-- AlterTable
ALTER TABLE "colors" ADD COLUMN     "swatchImageUrl" VARCHAR(500),
ALTER COLUMN "hexCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "inventory" DROP COLUMN "costPrice",
DROP COLUMN "productColorId",
DROP COLUMN "productId",
DROP COLUMN "productSizeId",
DROP COLUMN "sku",
ADD COLUMN     "variantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "basePrice",
DROP COLUMN "mainColorId";

-- DropTable
DROP TABLE "category_designs";

-- DropTable
DROP TABLE "product_colors";

-- DropTable
DROP TABLE "product_sizes";

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "colorId" UUID NOT NULL,
    "sizeId" UUID NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "costPrice" DECIMAL(10,2),
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "isMainColor" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE INDEX "product_variants_deletedAt_idx" ON "product_variants"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_productId_colorId_sizeId_key" ON "product_variants"("productId", "colorId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_variantId_key" ON "inventory"("variantId");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
