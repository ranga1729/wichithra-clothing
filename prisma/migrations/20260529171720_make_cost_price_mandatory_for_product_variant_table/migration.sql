/*
  Warnings:

  - You are about to drop the column `isMainColor` on the `product_variants` table. All the data in the column will be lost.
  - Made the column `costPrice` on table `product_variants` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "isMainColor",
ALTER COLUMN "costPrice" SET NOT NULL;
