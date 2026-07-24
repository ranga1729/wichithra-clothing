import * as z from "zod"
import { deleteCategorySchema, deleteColorSchema, deleteDesignSchema, getAuditLogSchema, getCategorySchema, getColorSchema, getDesignSchema, paymentRowSchema } from "./admin-schemas"

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

// Color CRUDs
export const colorListResponseSchema = z.object({
  colors: z.array(getColorSchema),
  totalRecords: z.number(),
});
export type ColorListResponseSchema = z.infer<typeof colorListResponseSchema>;

export const createColorResponseSchema = z.object({
  color: getColorSchema,
});
export type CreateColorResponseSchema = z.infer<typeof createColorResponseSchema>;

export const updateColorResponseSchema = z.object({
  color: deleteColorSchema,
});
export type UpdateColorResponseSchema = z.infer<typeof updateColorResponseSchema>;

export const deleteColorResponseSchema = z.object({
  color: deleteColorSchema,
});
export type DeleteColorResponseSchema = z.infer<typeof deleteColorResponseSchema>;

// Audit Logs
export const auditLogsResponseSchema = z.object({
  logs: z.array(getAuditLogSchema),
  totalRecords: z.number().int().nonnegative(),
});

export type AuditLogsResponseSchema = z.infer<typeof auditLogsResponseSchema>;

// Payments
export const paymentsResponseSchema = z.object({
  payments: z.array(paymentRowSchema),
  totalRecords: z.number().int().nonnegative(),
});
export type PaymentsResponseSchema = z.infer<typeof paymentsResponseSchema>;