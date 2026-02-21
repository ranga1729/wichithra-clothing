import { ProductStatus } from "@/generated/prisma/enums";
import * as z from "zod"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

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
    .instanceof(File)
    .refine((file) => file.size <= 5000000, "Max file size if 5MB")
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      "Only .jpg, .png, and .webp formats are supported"
    )
    .optional()
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
  name: z.string(),
});

const colorSelectSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  hexCode: z.string().length(6),
});

const productDesignSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  designId: z.uuid(),
  design: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
});

const productColorSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  colorId: z.uuid(),
  isMainColor: z.boolean(),
  colorImageUrl: z.string().nullable(),
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
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  material: z.string().nullable(),
  careInstructions: z.string().nullable(),
  basePrice: z.number(),
  discountPercentage: z.number().nullable(),
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
  name: z.string(),
  slug: z.string(),
  basePrice: z.number(),
  discountPercentage: z.number().nullable(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  status: z.enum(ProductStatus),
  category: categorySelectSchema,
  mainColor: colorSelectSchema.nullable(),
})

export type CategorySchema = z.infer<typeof categorySchema>
export type DesignSchema = z.infer<typeof designSchema>
export type ColorSchema = z.infer<typeof colorSchema>
export type ProductSchema = z.infer<typeof productSchema>
export type SimpleProductSchema = z.infer<typeof simpleProductSchema>