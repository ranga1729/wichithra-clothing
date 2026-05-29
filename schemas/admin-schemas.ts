import { AgeGroup, GenderTarget, ProductStatus } from "@/generated/prisma/enums";
import * as z from "zod"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
 
export const ProductStatusSchema = z.enum(ProductStatus);
export const AgeGroupSchema = z.enum(AgeGroup)
export const GenderSchema = z.enum(GenderTarget)

export const categorySchema = z.object({
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .optional(),
  sortOrder: z  
    .number()
    .int("Must be an integer")
    .min(0, "Must be zero or greater"),
})

export const designSchema = z.object({
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .optional(),
})

export const colorSchema = z.object({
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  hexCode: z
    .string()
    .length(6, "Color code must have 6 digits")
    .optional()
    .or(z.literal(""))
    .transform((val) => val === "" ? undefined : val),
})

//for products page
const categorySelectSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
});

const colorSelectSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  hexCode: z.string().length(6).nullable(),
  swatchImageUrl: z.string().nullable().optional(),
});

const designSelectSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
});

const productDesignSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  designId: z.uuid(),
  design: designSelectSchema
});

const productImageSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  colorId: z.uuid().nullable(),
  imageUrl: z.string(),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
});

const variantSizeSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
});

const variantSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  colorId: z.uuid(),
  sizeId: z.uuid(),
  sku: z.string(),
  costPrice: z.coerce.number().nullable(),
  sellingPrice: z.coerce.number(),
  isMainColor: z.boolean(),
  isActive: z.boolean(),
  color: colorSelectSchema,
  size: variantSizeSchema,
});

export const productSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  material: z.string().nullable(),
  careInstructions: z.string().nullable(),
  discountPercentage: z
    .coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  isFeatured: z.boolean(),
  status: z.enum(ProductStatus),

  category: categorySelectSchema,
  productDesigns: z.array(productDesignSchema),
  productImages: z.array(productImageSchema),
  variants: z.array(variantSchema),
});

export const simpleProductSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  description: z.string().nullable(),
  gender: GenderSchema,
  ageGroup: AgeGroupSchema,
  discountPercentage: z
    .coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  isFeatured: z.boolean(),
  status: z.enum(ProductStatus),
  category: categorySelectSchema,
})

export const basicProductInfoSchema = z.object({
  id: z.uuid().optional(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  category: categorySelectSchema,
  gender: GenderSchema,
  ageGroup: AgeGroupSchema,
  discountPercentage: z
    .coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  material: z.string().nullable(),
  careInstructions: z.string().nullable(),
  metaTitle: z.string().max(200).nullable(),
  metaDescription: z.string().nullable(),
});

// ─── Inventory ───────────────────────────────────────────────────────────────

// export const inventorySchema = z.object({
//   variantId: z.uuid("Invalid product variant"),
//   quantity: z
//     .coerce
//     .number()
//     .int("Quantity must be an integer")
//     .min(0, "Quantity must be 0 or more")
//     .default(0),
//   reservedQuantity: z
//     .coerce
//     .number()
//     .int("Reserved quantity must be an integer")
//     .min(0, "Reserved quantity must be 0 or more")
//     .default(0),
//   lowStockThreshold: z
//     .coerce
//     .number()
//     .int("Low stock threshold must be an integer")
//     .min(0, "Low stock threshold must be 0 or more")
//     .default(5)
//     .optional(),
// });

export const inventorySchema = z.object({
  id: z.uuid(),
  quantity: z.number().int(),
  reservedQuantity: z.number().int(),
  lowStockThreshold: z.number().int().nullable(),
  variant: z.object({
    id: z.uuid(),
    sku: z.string(),
    costPrice: z.coerce.number().nullable(),
    sellingPrice: z.coerce.number(),
    isMainColor: z.boolean(),
    isActive: z.boolean(),
    product: z.object({
      id: z.uuid(),
      name: z.string(),
      discountPercentage: z.coerce.number(),
      category: z.object({
        id: z.uuid(),
        name: z.string(),
      }),
    }),
    color: z.object({
      id: z.uuid(),
      name: z.string(),
      hexCode: z.string().nullable(),
      swatchImageUrl: z.string().nullable(),
    }),
    size: z.object({
      id: z.uuid(),
      name: z.string(),
    }),
  }),
});

export type CategorySchema = z.input<typeof categorySchema>
export type DesignSchema = z.infer<typeof designSchema>
export type ColorSchema = z.infer<typeof colorSchema>

export type ProductSchema = z.infer<typeof productSchema>
export type SimpleProductSchema = z.infer<typeof simpleProductSchema>

export type VariantSchema = z.infer<typeof variantSchema>
export type ProductDesignSchema = z.infer<typeof productDesignSchema>
export type BasicProductInfoSchema = z.input<typeof basicProductInfoSchema>;

//export type InventorySchema = z.infer<typeof inventorySchema>
export type InventorySchema = z.infer<typeof inventorySchema>