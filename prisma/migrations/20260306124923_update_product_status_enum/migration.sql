/*
  Warnings:

  - The values [ACTIVE] on the enum `product_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "product_status_new" AS ENUM ('DRAFT', 'DISCONTINUED', 'OUTOFSTOCK', 'AVAILABLE');
ALTER TABLE "public"."products" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "status" TYPE "product_status_new" USING ("status"::text::"product_status_new");
ALTER TYPE "product_status" RENAME TO "product_status_old";
ALTER TYPE "product_status_new" RENAME TO "product_status";
DROP TYPE "public"."product_status_old";
ALTER TABLE "products" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
