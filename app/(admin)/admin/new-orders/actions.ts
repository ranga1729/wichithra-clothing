'use server'

import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { NewOrderFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { OrderStatus } from "@/generated/prisma/enums";

const NEW_ORDER_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED];

export async function getNewOrders(paginator: Paginator, filter: NewOrderFilter): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    // Build date range filter when a date range is provided
    let dateFilter: { gte?: Date; lte?: Date } | undefined;
    if (filter.createdDateFrom || filter.createdDateTo) {
      dateFilter = {};
      if (filter.createdDateFrom) {
        const start = new Date(filter.createdDateFrom);
        start.setHours(0, 0, 0, 0);
        dateFilter.gte = start;
      }
      if (filter.createdDateTo) {
        const end = new Date(filter.createdDateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }

    // Build user name filter (search across firstName and lastName)
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

    const whereClause = {
      status: { in: NEW_ORDER_STATUSES },
      ...(filter.orderNumber && {
        orderNumber: { contains: filter.orderNumber.trim(), mode: 'insensitive' as const },
      }),
      ...(filter.paymentStatus && { paymentStatus: filter.paymentStatus as any }),
      ...(dateFilter && { createdAt: dateFilter }),
      ...userNameFilter,
    };

    const [orders, totalRecords] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          paymentStatus: true,
          subtotal: true,
          discountAmount: true,
          shippingFee: true,
          taxAmount: true,
          totalAmount: true,
          notes: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return {
      success: true,
      data: {
        orders: JSON.parse(JSON.stringify(orders)),
        totalRecords,
      },
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message || en.new_orders_data_retrieval_failed,
    };
  }
}
