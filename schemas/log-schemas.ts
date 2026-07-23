import * as z from "zod"

export const auditLogFilterSchema = z.object({
  userName: z.string().optional(),
  action: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type AuditLogFilterSchema = z.infer<typeof auditLogFilterSchema>

export const auditLogListResponseSchema = z.object({
  logs: z.array(z.any()),
  totalRecords: z.number(),
})

export type AuditLogListResponseSchema = z.infer<typeof auditLogListResponseSchema>
