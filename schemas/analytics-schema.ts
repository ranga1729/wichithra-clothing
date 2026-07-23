import * as z from "zod"

export const salesFilterSchema = z.object({
  preset: z
    .enum(["today", "yesterday", "last7days", "last30days", "thisMonth", "thisYear", "custom"])
    .default("last30days"),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type SalesFilter = z.input<typeof salesFilterSchema>
