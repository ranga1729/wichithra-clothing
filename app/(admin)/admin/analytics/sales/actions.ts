"use server"

import { requireRole } from "@/lib/server-auth-guard"
import { prisma } from "@/lib/prisma"
import { ApiResponse } from "@/types/auth-types"
import { SalesFilter, salesFilterSchema } from "@/schemas/analytics-schema"
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns"
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
      const d = subDays(now, 1)
      return { from: startOfDay(d), to: endOfDay(d) }
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
      const to = filter.dateTo ? endOfDay(new Date(filter.dateTo)) : endOfDay(now)
      return { from, to }
    }
    default:
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
  }
}

function resolveComparisonRange(
  currentRange: DateRange,
  mode: SalesFilter["comparison"]
): DateRange {
  const durationMs = currentRange.to.getTime() - currentRange.from.getTime()
  switch (mode) {
    case "previousMonth": {
      return {
        from: startOfDay(subMonths(currentRange.from, 1)),
        to: endOfDay(subMonths(currentRange.from, 1)),
      }
    }
    case "previousYear": {
      return {
        from: startOfDay(subYears(currentRange.from, 1)),
        to: endOfDay(subYears(currentRange.to, 1)),
      }
    }
    case "previousPeriod":
    default:
      return {
        from: new Date(currentRange.from.getTime() - durationMs),
        to: new Date(currentRange.from.getTime() - 1),
      }
  }
}

function buildWhereClause(range: DateRange): Prisma.OrderWhereInput {
  return {
    paymentStatus: "COMPLETED",
    createdAt: { gte: range.from, lte: range.to },
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
    aov:
      result._count > 0
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

  const dailyMap = new Map<
    string,
    {
      revenue: number
      grossSales: number
      discounts: number
      taxes: number
      orders: number
    }
  >()

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

function computeGrowth(current: number, previous: number): number | null {
  if (previous > 0) return ((current - previous) / previous) * 100
  if (current > 0) return 100
  return null
}

export type SalesAnalyticsData = {
  kpis: {
    totalRevenue: { value: number; growth: number | null }
    grossSales: { value: number; growth: number | null }
    totalDiscounts: { value: number; growth: number | null }
    taxesCollected: { value: number; growth: number | null }
    aov: { value: number; growth: number | null }
  }
  chartData: {
    date: string
    revenue: number
    grossSales: number
    discounts: number
    taxes: number
    orders: number
  }[]
  breakdown: {
    grossSales: number
    discounts: number
    taxes: number
    netRevenue: number
  }
  comparison: {
    current: { revenue: number; orders: number }
    previous: { revenue: number; orders: number }
  }
  insights: {
    discountRate: number
    taxRate: number
    revenuePerDay: number
    bestDay: { date: string; revenue: number; orders: number } | null
    highestAovDay: { date: string; aov: number; revenue: number } | null
  }
  hasData: boolean
  dateRange: { from: string; to: string }
}

export async function getSalesAnalytics(
  filter: SalesFilter
): Promise<ApiResponse<SalesAnalyticsData>> {
  try {
    await requireRole(["admin", "super-admin"])

    const parsed = salesFilterSchema.safeParse(filter)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid filter parameters",
      }
    }

    const range = resolveDateRange(parsed.data)
    const prevRange = resolveComparisonRange(range, parsed.data.comparison)

    const [current, previous, dailyRevenue] = await Promise.all([
      fetchOrderAggregates(buildWhereClause(range)),
      fetchOrderAggregates(buildWhereClause(prevRange)),
      fetchDailyRevenue(range),
    ])

    const hasData = current.orderCount > 0

    const bestDay = dailyRevenue.length
      ? dailyRevenue.reduce((best, day) =>
          day.revenue > best.revenue ? day : best
        )
      : null

    const highestAovDay = dailyRevenue.length
      ? dailyRevenue.reduce((best, day) => {
          const aov = day.orders > 0 ? day.revenue / day.orders : 0
          const bestAov = best.orders > 0 ? best.revenue / best.orders : 0
          return aov > bestAov ? day : best
        })
      : null

    const dayCount = Math.max(
      1,
      Math.round(
        (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    )

    return {
      success: true,
      data: {
        kpis: {
          totalRevenue: {
            value: current.totalRevenue,
            growth: computeGrowth(current.totalRevenue, previous.totalRevenue),
          },
          grossSales: {
            value: current.grossSales,
            growth: computeGrowth(current.grossSales, previous.grossSales),
          },
          totalDiscounts: {
            value: current.totalDiscounts,
            growth: computeGrowth(
              current.totalDiscounts,
              previous.totalDiscounts
            ),
          },
          taxesCollected: {
            value: current.taxesCollected,
            growth: computeGrowth(
              current.taxesCollected,
              previous.taxesCollected
            ),
          },
          aov: {
            value: current.aov,
            growth: computeGrowth(current.aov, previous.aov),
          },
        },
        chartData: dailyRevenue,
        breakdown: {
          grossSales: current.grossSales,
          discounts: current.totalDiscounts,
          taxes: current.taxesCollected,
          netRevenue: current.totalRevenue,
        },
        comparison: {
          current: { revenue: current.totalRevenue, orders: current.orderCount },
          previous: {
            revenue: previous.totalRevenue,
            orders: previous.orderCount,
          },
        },
        insights: {
          discountRate:
            current.grossSales > 0
              ? (current.totalDiscounts / current.grossSales) * 100
              : 0,
          taxRate:
            current.grossSales > 0
              ? (current.taxesCollected / current.grossSales) * 100
              : 0,
          revenuePerDay: current.totalRevenue / dayCount,
          bestDay: bestDay
            ? {
                date: bestDay.date,
                revenue: bestDay.revenue,
                orders: bestDay.orders,
              }
            : null,
          highestAovDay: highestAovDay
            ? {
                date: highestAovDay.date,
                aov:
                  highestAovDay.orders > 0
                    ? highestAovDay.revenue / highestAovDay.orders
                    : 0,
                revenue: highestAovDay.revenue,
              }
            : null,
        },
        hasData,
        dateRange: {
          from: range.from.toISOString(),
          to: range.to.toISOString(),
        },
      },
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AuthError") throw error
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch sales analytics",
    }
  }
}
