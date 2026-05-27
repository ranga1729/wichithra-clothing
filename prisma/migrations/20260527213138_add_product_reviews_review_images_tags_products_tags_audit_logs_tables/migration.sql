/*
  Warnings:

  - The `type` column on the `addresses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `phone_numbers` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `colorImageUrl` on the `product_colors` table. All the data in the column will be lost.
  - You are about to drop the column `isMainColor` on the `product_colors` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productSizeId,productColorId]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `colors` table without a default value. This is not possible if the table is not empty.
  - Made the column `reservedQuantity` on table `inventory` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `product_colors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `product_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `product_sizes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `sizes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "phone_type" AS ENUM ('MOBILE', 'HOME');

-- CreateEnum
CREATE TYPE "address_type" AS ENUM ('DELIVERY', 'BILLING');

-- DropIndex
DROP INDEX "inventory_productId_productSizeId_productColorId_key";

-- AlterTable
ALTER TABLE "addresses" ALTER COLUMN "addressLine2" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "address_type" NOT NULL DEFAULT 'DELIVERY';

-- AlterTable
ALTER TABLE "category_designs" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "colors" ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "inventory" ALTER COLUMN "reservedQuantity" SET NOT NULL;

-- AlterTable
ALTER TABLE "phone_numbers" DROP COLUMN "type",
ADD COLUMN     "type" "phone_type" NOT NULL DEFAULT 'MOBILE';

-- AlterTable
ALTER TABLE "product_colors" DROP COLUMN "colorImageUrl",
DROP COLUMN "isMainColor",
ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "product_designs" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "product_sizes" ADD COLUMN     "deletedAt" TIMESTAMPTZ(6),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "sizes" ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "reason" SET DATA TYPE VARCHAR(500);

-- DropEnum
DROP TYPE "AddressType";

-- DropEnum
DROP TYPE "PhoneType";

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "body" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_images" (
    "id" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "imageUrl" VARCHAR(500) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tags" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "tagId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entityId" UUID,
    "oldValues" JSONB,
    "newValues" JSONB,
    "description" VARCHAR(500),
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_reviews_productId_idx" ON "product_reviews"("productId");

-- CreateIndex
CREATE INDEX "product_reviews_isApproved_idx" ON "product_reviews"("isApproved");

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_productId_userId_key" ON "product_reviews"("productId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_tags_productId_tagId_key" ON "product_tags"("productId", "tagId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "category_designs_deletedAt_idx" ON "category_designs"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_productSizeId_productColorId_key" ON "inventory"("productSizeId", "productColorId");

-- CreateIndex
CREATE INDEX "product_colors_deletedAt_idx" ON "product_colors"("deletedAt");

-- CreateIndex
CREATE INDEX "product_designs_deletedAt_idx" ON "product_designs"("deletedAt");

-- CreateIndex
CREATE INDEX "product_images_deletedAt_idx" ON "product_images"("deletedAt");

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "product_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
