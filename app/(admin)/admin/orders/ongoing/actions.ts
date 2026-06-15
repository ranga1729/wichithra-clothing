'use server'

import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { OngoingOrderFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

const ONGOING_ORDER_STATUSES: OrderStatus[] = [OrderStatus.PROCESSING];

export async function getOngoingOrders(paginator: Paginator, filter: OngoingOrderFilter): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    // Build date range filter 
    // Set the hours, minutes,seconds and ms of the start and end dates. 
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

    // customer name filter. Check both first name and last name.
    const customerNameFilter = filter.customerName?.trim()
      ? {
          user: {
            OR: [
              { firstName: { contains: filter.customerName.trim(), mode: 'insensitive' as const } },
              { lastName: { contains: filter.customerName.trim(), mode: 'insensitive' as const } },
            ],
          },
        }
      : {};

    const whereClause = {
      status: { in: ONGOING_ORDER_STATUSES },
      ...(filter.orderNumber && {
        orderNumber: { contains: filter.orderNumber.trim(), mode: 'insensitive' as const },
      }),
      ...(filter.paymentStatus && { paymentStatus: filter.paymentStatus as PaymentStatus }),
      ...(dateFilter && { createdAt: dateFilter }),
      ...customerNameFilter,
    };

    const [orders, totalRecords] = await Promise.all([
      prisma.order.findMany({
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
        where: whereClause,
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
      error: error.message || en.failed_to_load_orders,
    };
  }
}

export async function getOrderItems(orderId: string): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        status: true,
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
            email: true,
          },
        },
        orderItems: {
          select: {
            id: true,
            sku: true,
            productName: true,
            sizeName: true,
            colorName: true,
            imageUrl: true,
            quantity: true,
            unitPrice: true,
            discountAmount: true,
            totalPrice: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return { 
        success: false, 
        error: en.order_not_found
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(order)),
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message || en.failed_to_load_order_details,
    };
  }
}
