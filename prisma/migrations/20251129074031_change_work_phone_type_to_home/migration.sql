/*
  Warnings:

  - The values [WORK] on the enum `PhoneType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PhoneType_new" AS ENUM ('MOBILE', 'HOME');
ALTER TABLE "public"."phone_numbers" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "phone_numbers" ALTER COLUMN "type" TYPE "PhoneType_new" USING ("type"::text::"PhoneType_new");
ALTER TYPE "PhoneType" RENAME TO "PhoneType_old";
ALTER TYPE "PhoneType_new" RENAME TO "PhoneType";
DROP TYPE "public"."PhoneType_old";
ALTER TABLE "phone_numbers" ALTER COLUMN "type" SET DEFAULT 'MOBILE';
COMMIT;
