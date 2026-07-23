import * as z from "zod"
import { deleteCategorySchema, deleteDesignSchema, getCategorySchema, getDesignSchema } from "./admin-schemas"

// Category CRUDs
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

// Design CRUDs
export const designListResponseSchema = z.object({
  designs: z.array(getDesignSchema),
  totalRecords: z.number(),
});
export type DesignListResponseSchema = z.infer<typeof designListResponseSchema>;

export const createDesignResponseSchema = z.object({
  design: getDesignSchema,
});
export type CreateDesignResponseSchema = z.infer<typeof createDesignResponseSchema>;

export const updateDesignResponseSchema = z.object({
  design: deleteDesignSchema,
});
export type UpdateDesignResponseSchema = z.infer<typeof updateDesignResponseSchema>;

export const deleteDesignResponseSchema = z.object({
  design: deleteDesignSchema,
});
export type DeleteDesignResponseSchema = z.infer<typeof deleteDesignResponseSchema>;