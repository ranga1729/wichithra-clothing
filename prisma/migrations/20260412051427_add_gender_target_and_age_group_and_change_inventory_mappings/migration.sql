/*
  Warnings:

  - You are about to drop the column `colorId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `sizeId` on the `inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productSizeId,productColorId]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productColorId` to the `inventory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productSizeId` to the `inventory` table without a default value. This is not possible if the table is not empty.
  - Made the column `discountPercentage` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "gender_target" AS ENUM ('MALE', 'FEMALE', 'UNISEX', 'BOYS', 'GIRLS', 'KIDS');

-- CreateEnum
CREATE TYPE "age_group" AS ENUM ('INFANT', 'TODDLER', 'KIDS', 'TEEN', 'ADULT');

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_colorId_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_productId_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_sizeId_fkey";

-- DropIndex
DROP INDEX "inventory_productId_colorId_sizeId_key";

-- DropIndex
DROP INDEX "inventory_productId_idx";

-- AlterTable
ALTER TABLE "inventory" DROP COLUMN "colorId",
DROP COLUMN "productId",
DROP COLUMN "sizeId",
ADD COLUMN     "productColorId" UUID NOT NULL,
ADD COLUMN     "productSizeId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "ageGroup" "age_group" NOT NULL DEFAULT 'ADULT',
ADD COLUMN     "gender" "gender_target" NOT NULL DEFAULT 'UNISEX',
ADD COLUMN     "sizeGuide" VARCHAR(500),
ALTER COLUMN "brand" SET DEFAULT 'Wichithra',
ALTER COLUMN "discountPercentage" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "inventory_productSizeId_productColorId_key" ON "inventory"("productSizeId", "productColorId");

-- CreateIndex
CREATE INDEX "products_gender_idx" ON "products"("gender");

-- CreateIndex
CREATE INDEX "products_ageGroup_idx" ON "products"("ageGroup");

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "product_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_productColorId_fkey" FOREIGN KEY ("productColorId") REFERENCES "product_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
