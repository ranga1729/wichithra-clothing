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

export type ProductSearchResult = z.infer<typeof product_search_result>
export type SearchResultColors = z.infer<typeof search_result_color>