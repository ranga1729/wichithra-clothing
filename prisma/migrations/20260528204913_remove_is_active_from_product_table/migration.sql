/*
  Warnings:

  - You are about to drop the column `isActive` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "products_isActive_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "isActive";
