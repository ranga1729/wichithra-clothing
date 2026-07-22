import * as z from "zod"
import { deleteCategorySchema, getCategorySchema } from "./admin-schemas"



export const categoryListResponseSchema = z.object({
  categories: z.array(getCategorySchema),
  totalRecords: z.number()
})
export type CategoryListResponseSchema = z.infer<typeof categoryListResponseSchema>

export const createCategoryResponseSchema = z.object({
  category: getCategorySchema,
})
export type CreateCategoryResponseSchema = z.infer<typeof createCategoryResponseSchema>

export const deleteCategoryResponseSchema = z.object({
  category: deleteCategorySchema,
})
export type DeleteCategoryResponseSchema = z.infer<typeof deleteCategoryResponseSchema>

export const updateCategoryResponseSchema = z.object({
  category: deleteCategorySchema,
})
export type UpdateCategoryResponseSchema = z.infer<typeof updateCategoryResponseSchema>
