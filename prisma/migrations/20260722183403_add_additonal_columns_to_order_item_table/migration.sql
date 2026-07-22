/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `order_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_inventoryId_fkey";

-- DropIndex
DROP INDEX "categories_name_key";

-- DropIndex
DROP INDEX "collections_name_key";

-- DropIndex
DROP INDEX "designs_name_key";

-- AlterTable
ALTER TABLE "colors" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "imageUrl",
ADD COLUMN     "ageGroup" "age_group" NOT NULL DEFAULT 'ADULT',
ADD COLUMN     "brandName" VARCHAR(100),
ADD COLUMN     "categoryName" VARCHAR(100) NOT NULL DEFAULT 'Uncategorized',
ADD COLUMN     "categorySlug" VARCHAR(100) NOT NULL DEFAULT 'uncategorized',
ADD COLUMN     "colorHexCode" CHAR(6),
ADD COLUMN     "gender" "gender_target" NOT NULL DEFAULT 'UNISEX',
ADD COLUMN     "primaryImageUrl" VARCHAR(500),
ADD COLUMN     "productId" UUID,
ADD COLUMN     "productSlug" VARCHAR(200) NOT NULL DEFAULT 'legacy-product',
ADD COLUMN     "swatchImageUrl" CHAR(6),
ADD COLUMN     "variantId" UUID,
ALTER COLUMN "inventoryId" DROP NOT NULL,
ALTER COLUMN "colorName" SET DATA TYPE VARCHAR(100);

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
