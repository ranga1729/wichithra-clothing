/*
  Warnings:

  - Made the column `hexCode` on table `colors` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "colors" ALTER COLUMN "hexCode" SET NOT NULL;
