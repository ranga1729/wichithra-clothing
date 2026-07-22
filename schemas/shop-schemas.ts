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

// Search Filters
export const search_filters_schema = z.object({
  category: z.array(z.string()).optional(),
  design: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  size: z.array(sizes).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortColumn: z.enum(["name", "price", "recently_added"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export const search_filter_option = z.object({
  name: z.string(),
  value: z.string(),
})

export const search_filter_options_schema = z.object({
  categories: z.array(search_filter_option),
  designs: z.array(search_filter_option),
  colors: z.array(z.object({
    name: z.string(),
    hexCode: z.string().nullable(),
    swatchImageUrl: z.string().nullable(),
  })),
  sizes: z.array(sizes),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
})

export type SearchFilters = z.infer<typeof search_filters_schema>
export type SearchFilterOption = z.infer<typeof search_filter_option>
export type SearchFilterOptions = z.infer<typeof search_filter_options_schema>

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
  sellingPrice: z.number(),
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