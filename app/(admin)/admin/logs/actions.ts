'use server'

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { AuditLogFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { Prisma } from "@/generated/prisma/client";

export interface CreateAuditLogParams {
  userId: string
  action: string
  entity: string
  entityId?: string
  oldValues?: Prisma.InputJsonValue
  newValues?: Prisma.InputJsonValue
  description?: string
  ipAddress?: string
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        oldValues: params.oldValues ?? undefined,
        newValues: params.newValues ?? undefined,
        description: params.description ?? null,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogs(paginator: Paginator, filter: AuditLogFilter): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    if (filter.dateFrom || filter.dateTo) {
      dateFilter = {};
      if (filter.dateFrom) {
        const start = new Date(filter.dateFrom);
        start.setHours(0, 0, 0, 0);
        dateFilter.gte = start;
      }
      if (filter.dateTo) {
        const end = new Date(filter.dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }

    const userNameFilter = filter.userName?.trim()
      ? {
          user: {
            OR: [
              { firstName: { contains: filter.userName.trim(), mode: 'insensitive' as const } },
              { lastName: { contains: filter.userName.trim(), mode: 'insensitive' as const } },
            ],
          },
        }
      : {};

    const whereClause: Prisma.AuditLogWhereInput = {
      ...(filter.action && { action: filter.action }),
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

    return {
      success: true,
      data: {
        logs: JSON.parse(JSON.stringify(logs)),
        totalRecords,
      },
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : "Failed to load audit logs";
    return {
      success: false,
      error: message,
    };
  }
}
