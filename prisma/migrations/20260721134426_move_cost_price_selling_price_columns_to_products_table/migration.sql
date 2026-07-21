/*
  Warnings:

  - You are about to drop the column `costPrice` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `sellingPrice` on the `product_variants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "costPrice",
DROP COLUMN "sellingPrice";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sellingPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;
