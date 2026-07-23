"use server"

import { requireRole } from "@/lib/server-auth-guard"
import { prisma } from "@/lib/prisma"
import { ApiResponse } from "@/types/auth-types"
import { SalesFilter, salesFilterSchema } from "@/schemas/analytics-schema"
import { startOfDay, endOfDay, subDays, startOfMonth, startOfYear } from "date-fns"
import { Prisma } from "@/generated/prisma/client"

interface DateRange {
  from: Date
  to: Date
}

function resolveDateRange(filter: SalesFilter): DateRange {
  const now = new Date()
  switch (filter.preset) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) }
    case "yesterday": {
      const yesterday = subDays(now, 1)
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) }
    }
    case "last7days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    case "last30days":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
    case "thisMonth":
      return { from: startOfMonth(now), to: endOfDay(now) }
    case "thisYear":
      return { from: startOfYear(now), to: endOfDay(now) }
    case "custom": {
      const from = filter.dateFrom
        ? startOfDay(new Date(filter.dateFrom))
        : startOfDay(subDays(now, 29))
      const to = filter.dateTo
        ? endOfDay(new Date(filter.dateTo))
        : endOfDay(now)
      return { from : from, to: to }
    }
    default:
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
  }
}

function resolvePreviousDateRange(range: DateRange): DateRange {
  const durationMs = range.to.getTime() - range.from.getTime()
  return {
    from: new Date(range.from.getTime() - durationMs),
    to: new Date(range.from.getTime() - 1),
  }
}

function buildWhereClause(range: DateRange): Prisma.OrderWhereInput {
  return {
    paymentStatus: "COMPLETED",
    createdAt: {
      gte: range.from,
      lte: range.to,
    },
  }
}

async function fetchOrderAggregates(where: Prisma.OrderWhereInput) {
  const result = await prisma.order.aggregate({
    where,
    _sum: {
      totalAmount: true,
      subtotal: true,
      discountAmount: true,
      taxAmount: true,
    },
    _count: true,
  })

  return {
    totalRevenue: Number(result._sum.totalAmount ?? 0),
    grossSales: Number(result._sum.subtotal ?? 0),
    totalDiscounts: Number(result._sum.discountAmount ?? 0),
    taxesCollected: Number(result._sum.taxAmount ?? 0),
    orderCount: result._count,
    aov: result._count > 0
      ? Number(result._sum.totalAmount ?? 0) / result._count
      : 0,
  }
}

async function fetchDailyRevenue(range: DateRange) {
  const orders = await prisma.order.findMany({
    where: buildWhereClause(range),
    select: {
      createdAt: true,
      totalAmount: true,
      subtotal: true,
      discountAmount: true,
      taxAmount: true,
    },
    orderBy: { createdAt: "asc" },
  })

  const dailyMap = new Map<string, { revenue: number; grossSales: number; discounts: number; taxes: number; orders: number }>()

  for (const order of orders) {
    const day = order.createdAt.toISOString().split("T")[0]
    const existing = dailyMap.get(day)
    if (existing) {
      existing.revenue += Number(order.totalAmount)
      existing.grossSales += Number(order.subtotal)
      existing.discounts += Number(order.discountAmount)
      existing.taxes += Number(order.taxAmount)
      existing.orders += 1
    } else {
      dailyMap.set(day, {
        revenue: Number(order.totalAmount),
        grossSales: Number(order.subtotal),
        discounts: Number(order.discountAmount),
        taxes: Number(order.taxAmount),
        orders: 1,
      })
    }
  }

  return Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export async function getSalesAnalytics(
  filter: SalesFilter
): Promise<ApiResponse<{
  kpis: {
    totalRevenue: number
    grossSales: number
    totalDiscounts: number
    taxesCollected: number
    aov: number
    revenueGrowth: number | null
    previousTotalRevenue: number | null
  }
  chartData: { date: string; revenue: number; grossSales: number; discounts: number; taxes: number; orders: number }[]
}>> {
  try {
    await requireRole(["admin", "super-admin"])

    const parsed = salesFilterSchema.safeParse(filter)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid filter parameters" }
    }

    const range = resolveDateRange(parsed.data)
    const prevRange = resolvePreviousDateRange(range)

    const [currentData, previousData, dailyRevenueRaw] = await Promise.all([
      fetchOrderAggregates(buildWhereClause(range)),
      fetchOrderAggregates(buildWhereClause(prevRange)),
      fetchDailyRevenue(range),
    ])

    const revenueGrowth =
      previousData.totalRevenue > 0
        ? ((currentData.totalRevenue - previousData.totalRevenue) / previousData.totalRevenue) * 100
        : currentData.totalRevenue > 0
          ? 100
          : null

    return {
      success: true,
      data: {
        kpis: {
          totalRevenue: currentData.totalRevenue,
          grossSales: currentData.grossSales,
          totalDiscounts: currentData.totalDiscounts,
          taxesCollected: currentData.taxesCollected,
          aov: currentData.aov,
          revenueGrowth,
          previousTotalRevenue: previousData.totalRevenue,
        },
        chartData: dailyRevenueRaw,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AuthError") throw error
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sales analytics",
    }
  }
}
