"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Wallet,
  ShoppingBag,
  BadgePercent,
  Receipt,
  ChartColumn,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

interface KpiItem {
  label: string
  value: string
  growth: number | null
  icon: React.ReactNode
  accent: string
  sparkline: { value: number }[]
}

interface SalesKpiCardsProps {
  kpis: {
    totalRevenue: { value: number; growth: number | null }
    grossSales: { value: number; growth: number | null }
    totalDiscounts: { value: number; growth: number | null }
    taxesCollected: { value: number; growth: number | null }
    aov: { value: number; growth: number | null }
  }
  chartData: { date: string; revenue: number; grossSales: number; discounts: number; taxes: number; orders: number }[]
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `LKR ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `LKR ${(value / 1_000).toFixed(1)}K`
  return `LKR ${value.toFixed(0)}`
}

function formatPercent(value: number | null): string {
  if (value === null) return "—"
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

const ACCENT_CLASSES: Record<string, string> = {
  green: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
  blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
  orange: "text-orange-600 bg-orange-50 dark:bg-orange-950/50",
  purple: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
  indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50",
}

const LINE_COLORS: Record<string, string> = {
  green: "#10b981",
  blue: "#3b82f6",
  orange: "#f97316",
  purple: "#a855f7",
  indigo: "#6366f1",
}

export default function SalesKpiCards({ kpis, chartData }: SalesKpiCardsProps) {
  const buildSparkline = (key: "revenue" | "grossSales" | "discounts" | "taxes" | "orders"): { value: number }[] => {
    if (!chartData.length) return []
    const step = Math.max(1, Math.floor(chartData.length / 12))
    return chartData
      .filter((_, i) => i % step === 0 || i === chartData.length - 1)
      .map((d) => ({ value: d[key] }))
  }

  const items: KpiItem[] = [
    {
      label: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue.value),
      growth: kpis.totalRevenue.growth,
      icon: <Wallet className="size-4" />,
      accent: "green",
      sparkline: buildSparkline("revenue"),
    },
    {
      label: "Gross Sales",
      value: formatCurrency(kpis.grossSales.value),
      growth: kpis.grossSales.growth,
      icon: <ShoppingBag className="size-4" />,
      accent: "blue",
      sparkline: buildSparkline("grossSales"),
    },
    {
      label: "Discounts Given",
      value: formatCurrency(kpis.totalDiscounts.value),
      growth: kpis.totalDiscounts.growth,
      icon: <BadgePercent className="size-4" />,
      accent: "orange",
      sparkline: buildSparkline("discounts"),
    },
    {
      label: "Tax Collected",
      value: formatCurrency(kpis.taxesCollected.value),
      growth: kpis.taxesCollected.growth,
      icon: <Receipt className="size-4" />,
      accent: "purple",
      sparkline: buildSparkline("taxes"),
    },
    {
      label: "Avg Order Value",
      value: formatCurrency(kpis.aov.value),
      growth: kpis.aov.growth,
      icon: <ChartColumn className="size-4" />,
      accent: "indigo",
      sparkline: buildSparkline("orders"),
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {item.label}
              </span>
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg",
                  ACCENT_CLASSES[item.accent]
                )}
              >
                {item.icon}
              </div>
            </div>

            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight">
                {item.value}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {item.growth !== null ? (
                  item.growth >= 0 ? (
                    <TrendingUp className="size-3 text-emerald-600" />
                  ) : (
                    <TrendingDown className="size-3 text-red-600" />
                  )
                ) : (
                  <Minus className="size-3 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    item.growth === null
                      ? "text-muted-foreground"
                      : item.growth >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                  )}
                >
                  {formatPercent(item.growth)}
                </span>
                <span className="text-xs text-muted-foreground">
                  vs prev.
                </span>
              </div>

              {item.sparkline.length > 1 && (
                <div className="h-8 w-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={item.sparkline}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={LINE_COLORS[item.accent]}
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
