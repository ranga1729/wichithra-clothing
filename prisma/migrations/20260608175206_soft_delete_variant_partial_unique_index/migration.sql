-- DropIndex
DROP INDEX "product_variants_productId_colorId_sizeId_key";

-- Add a partial unique index that only enforces uniqueness among non-deleted rows.
-- Soft-deleted rows (deleted_at IS NOT NULL) are excluded from the constraint,
-- allowing the same product+color+size combination to be re-created after deletion.
CREATE UNIQUE INDEX "product_variants_active_unique"
  ON "product_variants" ("productId", "colorId", "sizeId")
  WHERE "deletedAt" IS NULL;
