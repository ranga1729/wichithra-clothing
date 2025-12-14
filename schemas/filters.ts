import * as z from "zod"

export const categoryFilterSchema = z.object({
  name: z
    .string()
    .optional(),
  slug: z
    .string()
    .optional(),
  sortColumn: z
    .string()
    .optional()
})

export type CategoryFilter = z.infer<typeof categoryFilterSchema>