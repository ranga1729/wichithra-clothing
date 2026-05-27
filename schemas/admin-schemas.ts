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
  sizeGuide: z  
    .url()
    .optional()
    .or(z.literal(""))
    .transform((val) => val === "" ? undefined : val),
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
  hexCode : z
    .string("Enter a valid color code")
    .length(6, "Color code must have 6 digits"),
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
  hexCode: z.string().length(6),
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

const productColorSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  colorId: z.uuid(),
  additionalPrice: z.coerce.number().nullable(),
  color: colorSelectSchema,
});

const productImageSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  colorId: z.uuid().nullable(),
  imageUrl: z.string(),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
});

const productSizeSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  sizeId: z.uuid(),
  isActive: z.boolean(),
  size: z.object({
    id: z.uuid(),
    name: z.string(),
    description: z.string().nullable(),
    sortOrder: z.number().int(),
  }),
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
  basePrice: z
    .coerce
    .number()
    .min(0)
    .default(0),
  discountPercentage: z
    .coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  status: z.enum(ProductStatus),

  category: categorySelectSchema,
  mainColor: colorSelectSchema.nullable(),
  productDesigns: z.array(productDesignSchema),
  productColors: z.array(productColorSchema),
  productImages: z.array(productImageSchema),
  productSizes: z.array(productSizeSchema),
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
  gender: GenderSchema,
  ageGroup: AgeGroupSchema,
  basePrice: z
    .coerce
    .number()
    .min(0)
    .default(0),
  discountPercentage: z
    .coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  status: z.enum(ProductStatus),
  category: categorySelectSchema,
  mainColor: colorSelectSchema.nullable(),
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
  basePrice: z
    .preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0, "Price must be 0 or more")
    )
    .default(0),
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
});

// ─── Inventory ───────────────────────────────────────────────────────────────

export const inventorySchema = z.object({
  productSizeId: z.uuid("Invalid product size"),
  productColorId: z.uuid("Invalid product color"),
  sku: z
    .string("Enter a valid SKU")
    .min(1, "SKU is required")
    .max(100, "SKU can not exceed 100 characters")
    .transform((val) => val.trim()),
  quantity: z
    .coerce
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity must be 0 or more")
    .default(0),
  reservedQuantity: z
    .coerce
    .number()
    .int("Reserved quantity must be an integer")
    .min(0, "Reserved quantity must be 0 or more")
    .default(0),
  lowStockThreshold: z
    .coerce
    .number()
    .int("Low stock threshold must be an integer")
    .min(0, "Low stock threshold must be 0 or more")
    .default(5)
    .optional(),
  costPrice: z
    .coerce
    .number()
    .min(0, "Cost price must be 0 or more")
    .nullable()
    .optional(),
});

export const simpleInventorySchema = z.object({
  id: z.uuid(),
  sku: z.string(),
  quantity: z.number().int(),
  reservedQuantity: z.number().int(),
  lowStockThreshold: z.number().int().nullable(),
  costPrice: z.coerce.number().nullable(),
  productSize: z.object({
    id: z.uuid(),
    product: z.object({
      id: z.uuid(),
      name: z.string(),
    }),
    size: z.object({
      id: z.uuid(),
      name: z.string(),
    }),
  }),
  productColor: z.object({
    id: z.uuid(),
    color: z.object({
      id: z.uuid(),
      name: z.string(),
      hexCode: z.string(),
    }),
  }),
});

export type CategorySchema = z.input<typeof categorySchema>
export type DesignSchema = z.infer<typeof designSchema>
export type ColorSchema = z.infer<typeof colorSchema>

export type ProductSchema = z.infer<typeof productSchema>
export type SimpleProductSchema = z.infer<typeof simpleProductSchema>

export type ProductColorSchema = z.infer<typeof productColorSchema>
export type ProductSizeSchema = z.infer<typeof productSizeSchema>
export type ProductDesignSchema = z.infer<typeof productDesignSchema>
export type BasicProductInfoSchema = z.infer<typeof basicProductInfoSchema>;

export type InventorySchema = z.infer<typeof inventorySchema>
export type SimpleInventorySchema = z.infer<typeof simpleInventorySchema>