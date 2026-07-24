'use server'

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
// import { AuditLogFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { Prisma } from "@/generated/prisma/client";
import { AuditLogFilter, auditLogFilterSchema, CreateAuditLogParams, createAuditLogSchema, getAuditLogSchema } from "@/schemas/admin-schemas";
import z from "zod";
import { auditLogsResponseSchema, AuditLogsResponseSchema } from "@/schemas/server-action-responses";

// export interface CreateAuditLogParams {
//   userId: string
//   action: string
//   entity: string
//   entityId?: string
//   oldValues?: Prisma.InputJsonValue
//   newValues?: Prisma.InputJsonValue
//   description?: string
//   ipAddress?: string
// }

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    const validated = createAuditLogSchema.parse(params)

    await prisma.auditLog.create({
      data: {
        userId: validated.userId,
        action: validated.action,
        entity: validated.entity,
        entityId: validated.entityId ?? null,
        oldValues: validated.oldValues ?? undefined,
        newValues: validated.newValues ?? undefined,
        description: validated.description ?? null,
        ipAddress: validated.ipAddress ?? null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error in createAuditLog:", error.message);
      // You might want to throw a specific error or log
      throw new Error("Invalid audit log parameters");
    }
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogs(paginator: Paginator, filter: AuditLogFilter): Promise<ApiResponse<AuditLogsResponseSchema>> {
  try {
    await requireRole(["admin", "super-admin"]);

    const validatedFilter = auditLogFilterSchema.parse(filter);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    let dateFilter: { gte?: Date; lte?: Date } | undefined;

    if (validatedFilter.dateFrom || validatedFilter.dateTo) {
      dateFilter = {};
      if (validatedFilter.dateFrom) {
        const start = new Date(validatedFilter.dateFrom);
        start.setHours(0, 0, 0, 0);
        dateFilter.gte = start;
      }
      if (validatedFilter.dateTo) {
        const end = new Date(validatedFilter.dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }

    const userNameFilter = validatedFilter.userName?.trim()
      ? {
          user: {
            OR: [
              { firstName: { contains: validatedFilter.userName.trim(), mode: 'insensitive' as const } },
              { lastName: { contains: validatedFilter.userName.trim(), mode: 'insensitive' as const } },
            ],
          },
        }
      : {};

    const whereClause: Prisma.AuditLogWhereInput = {
      ...(validatedFilter.action && { action: validatedFilter.action }),
      ...(dateFilter && { createdAt: dateFilter }),
      ...userNameFilter,
    };

    const [logs, totalRecords] = await Promise.all([
      prisma.auditLog.findMany({
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          description: true,
          oldValues: true,
          newValues: true,
          ipAddress: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),

      prisma.auditLog.count({ where: whereClause }),
    ]);

    const responseData = {
      logs: logs.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
      })),
      totalRecords : totalRecords,
    };

    const validatedData = auditLogsResponseSchema.parse(responseData);

    return {
      success: true,
      data: validatedData,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid filter parameters: " + error.message,
      };
    }
    const message = error instanceof Error ? error.message : "Failed to load audit logs";
    return {
      success: false,
      error: message,
    };
  }
}
