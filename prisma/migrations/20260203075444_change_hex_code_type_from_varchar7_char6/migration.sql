/*
  Warnings:

  - You are about to alter the column `hexCode` on the `colors` table. The data in that column could be lost. The data in that column will be cast from `Char(7)` to `Char(6)`.

*/
-- AlterTable
ALTER TABLE "colors" ALTER COLUMN "hexCode" SET DATA TYPE CHAR(6);
