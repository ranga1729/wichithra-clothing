'use server'

import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { Paginator } from "@/types/table-types";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { OrderStatus, PaymentMethod, PaymentStatus, StockMovementType } from "@/generated/prisma/enums";
import { createAuditLog } from "@/app/(admin)/admin/logs/actions";
import { PaymentFilter, paymentFilterSchema } from "@/schemas/admin-schemas";
import { PaymentsResponseSchema } from "@/schemas/server-action-responses";
import { Prisma } from "@/generated/prisma/client";
import z from "zod";

export async function getPayments(paginator: Paginator, filter: PaymentFilter): Promise<ApiResponse<PaymentsResponseSchema>> {
  try {
    await requireRole(["admin", "super-admin"]);

    const validatedFilter = paymentFilterSchema.parse(filter);

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

    const searchFilter = validatedFilter.search?.trim()
      ? {
          OR: [
            { order: { orderNumber: { contains: validatedFilter.search.trim(), mode: 'insensitive' as const } } },
            { order: { user: { firstName: { contains: validatedFilter.search.trim(), mode: 'insensitive' as const } } } },
            { order: { user: { lastName: { contains: validatedFilter.search.trim(), mode: 'insensitive' as const } } } },
          ],
        }
      : {};

    const amountFilter: Prisma.DecimalFilter = {};
    if (validatedFilter.minAmount) {
      const min = parseFloat(validatedFilter.minAmount);
      if (!isNaN(min)) {
        amountFilter.gte = min;
      }
    }
    if (validatedFilter.maxAmount) {
      const max = parseFloat(validatedFilter.maxAmount);
      if (!isNaN(max)) {
        amountFilter.lte = max;
      }
    }

    const whereClause: Prisma.PaymentWhereInput = {
      ...(validatedFilter.paymentMethod && { method: validatedFilter.paymentMethod as PaymentMethod }),
      ...(dateFilter && { createdAt: dateFilter }),
      ...(Object.keys(amountFilter).length > 0 && { amount: amountFilter }),
      ...searchFilter,
    };

    const [payments, totalRecords] = await Promise.all([
      prisma.payment.findMany({
        select: {
          id: true,
          orderId: true,
          amount: true,
          currency: true,
          method: true,
          status: true,
          gatewayTransactionId: true,
          paidAt: true,
          refundedAt: true,
          createdAt: true,
          order: {
            select: {
              orderNumber: true,
              status: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),

      prisma.payment.count({ where: whereClause }),
    ]);

    const responseData = {
      payments: payments.map((p) => ({
        ...p,
        amount: Number(p.amount),
        method: p.method,
        status: p.status,
        paidAt: p.paidAt,
        refundedAt: p.refundedAt,
        createdAt: p.createdAt,
        order: {
          ...p.order,
          status: p.order.status,
        },
      })),
      totalRecords,
    };

    return {
      success: true,
      data: responseData,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid filter parameters: " + error.message,
      };
    }
    const message = error instanceof Error ? error.message : en.failed_to_load_payments;
    return {
      success: false,
      error: message,
    };
  }
}

export async function cancelOrderAndRefund(paymentId: string, reason: string): Promise<ApiResponse> {
  try {
    const adminUser = await requireRole(["admin", "super-admin"]);

    if (!reason?.trim()) {
      return { success: false, error: en.cancel_reason_required };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        orderId: true,
        status: true,
        order: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: en.payment_not_found };
    }

    const order = payment.order;
    const cancellableStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
    ];

    if (!cancellableStatuses.includes(order.status as OrderStatus)) {
      return { success: false, error: en.order_not_cancellable };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: reason.trim(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.CANCELLED,
          notes: reason.trim(),
          createdBy: adminUser.userId,
        },
      });

      const orderItems = await tx.orderItem.findMany({
        where: { orderId: order.id },
        select: { inventoryId: true, quantity: true },
      });

      for (const item of orderItems) {
        if (!item.inventoryId) continue;

        await tx.inventory.update({
          where: { id: item.inventoryId },
          data: {
            quantity: { increment: item.quantity },
          },
        });

        await tx.stockMovement.create({
          data: {
            inventoryId: item.inventoryId,
            movementType: StockMovementType.RELEASED,
            quantity: item.quantity,
            reason: "Order cancelled and refunded - inventory restored",
            referenceId: order.id,
            createdBy: adminUser.userId,
          },
        });
      }

      await tx.payment.updateMany({
        where: { orderId: order.id, status: { not: PaymentStatus.REFUNDED } },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
        },
      });
    });

    try {
      await createAuditLog({
        userId: adminUser.userId,
        action: "UPDATE",
        entity: "Order",
        entityId: order.id,
        newValues: { status: OrderStatus.CANCELLED, reason: reason.trim() },
        description: `Cancelled order and refunded payment: ${reason.trim()}`,
      });
    } catch {
      console.error("Failed to create audit log for order:", order.id);
    }

    return { success: true, message: en.order_cancelled_and_refunded };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : en.failed_to_cancel_order_and_refund,
    };
  }
}

export async function refundOnly(paymentId: string, reason: string): Promise<ApiResponse> {
  try {
    const adminUser = await requireRole(["admin", "super-admin"]);

    if (!reason?.trim()) {
      return { success: false, error: en.refund_reason_required };
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        orderId: true,
        status: true,
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
    });

    if (!payment) {
      return { success: false, error: en.payment_not_found };
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      return { success: false, error: en.payment_already_refunded };
    }

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });

    try {
      await createAuditLog({
        userId: adminUser.userId,
        action: "UPDATE",
        entity: "Payment",
        entityId: paymentId,
        newValues: { status: PaymentStatus.REFUNDED, reason: reason.trim() },
        description: `Refunded payment for order ${payment.order.orderNumber}: ${reason.trim()}`,
      });
    } catch {
      console.error("Failed to create audit log for payment:", paymentId);
    }

    return { success: true, message: en.payment_refunded_successfully };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : en.failed_to_refund_payment,
    };
  }
}
