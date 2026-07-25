-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "coverImage" VARCHAR(500);

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "swatchImageUrl" SET DATA TYPE VARCHAR(500);
