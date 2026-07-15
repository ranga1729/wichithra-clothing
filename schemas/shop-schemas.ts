import { ClothingSize, ProductStatus } from "@/generated/prisma/enums"
import * as z from "zod"

export const sizes = z.enum(ClothingSize)
export const status = z.enum(ProductStatus);

export const search_result_color = z.object({
  name: z.string(),
  hexCode: z
    .string()
    .length(6)
    .optional(),
  swatchImageUrl: z
    .string()
    .optional()
})

export const product_search_result = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  categoryName: z.string(),
  colors: z.array(search_result_color),
  sizes: z.array(sizes),
  status: status,
  price: z.number(),
  primaryImage: z.string(),
})

// Product Detail
export const product_detail_color = z.object({
  id: z.uuid(),
  name: z.string(),
  hexCode: z.string().nullable(),
  swatchImageUrl: z.string().nullable(),
})

export const product_detail_variant = z.object({
  id: z.uuid(),
  size: sizes,
  sellingPrice: z.number(),
  isActive: z.boolean(),
  color: product_detail_color,
})

export const product_detail_image = z.object({
  id: z.uuid(),
  imageUrl: z.string(),
  altText: z.string().nullable(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
  colorId: z.string().uuid().nullable(),
})

export const product_detail = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  brand: z.string(),
  material: z.string().nullable(),
  careInstructions: z.string().nullable(),
  discountPercentage: z.number(),
  gender: z.string(),
  ageGroup: z.string(),
  category: z.object({
    name: z.string(),
    slug: z.string(),
  }),
  productImages: z.array(product_detail_image),
  variants: z.array(product_detail_variant),
})

export type ProductSearchResult = z.infer<typeof product_search_result>
export type SearchResultColors = z.infer<typeof search_result_color>
export type ProductDetail = z.infer<typeof product_detail>
export type ProductDetailColor = z.infer<typeof product_detail_color>
export type ProductDetailVariant = z.infer<typeof product_detail_variant>
export type ProductDetailImage = z.infer<typeof product_detail_image>