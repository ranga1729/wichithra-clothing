/*
  Warnings:

  - You are about to drop the column `sizeId` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the `sizes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "clothing_size" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS');

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_sizeId_fkey";

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "sizeId",
ADD COLUMN     "size" "clothing_size" NOT NULL DEFAULT 'OS';

-- DropTable
DROP TABLE "sizes";
