"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComparisonProps {
  comparison: {
    current: { revenue: number; orders: number }
    previous: { revenue: number; orders: number }
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const chartConfig = {
  current: { label: "Current Period", color: "var(--chart-1)" },
  previous: { label: "Previous Period", color: "var(--chart-4)" },
} satisfies ChartConfig

export default function SalesComparisonChart({ comparison }: ComparisonProps) {
  const { current, previous } = comparison

  const growth =
    previous.revenue > 0
      ? ((current.revenue - previous.revenue) / previous.revenue) * 100
      : current.revenue > 0
        ? 100
        : null

  const absoluteDiff = current.revenue - previous.revenue

  const data = [
    { name: "Revenue", current: current.revenue, previous: previous.revenue },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Revenue Comparison
          </CardTitle>
          {growth !== null && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                growth >= 0
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
              )}
            >
              {growth >= 0 ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              tickFormatter={(value: number) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={false}
              width={0}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Bar dataKey="previous" fill="var(--color-previous)" radius={4} barSize={32} />
            <Bar dataKey="current" fill="var(--color-current)" radius={4} barSize={32} />
          </BarChart>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Period</p>
            <p className="text-sm font-semibold">{formatCurrency(current.revenue)}</p>
            <p className="text-xs text-muted-foreground">
              {current.orders} orders
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Previous Period</p>
            <p className="text-sm font-semibold">{formatCurrency(previous.revenue)}</p>
            <p className="text-xs text-muted-foreground">
              {previous.orders} orders
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Difference</p>
            <div className="flex items-center gap-1">
              {growth !== null ? (
                growth >= 0 ? (
                  <TrendingUp className="size-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="size-3 text-destructive" />
                )
              ) : (
                <Minus className="size-3 text-muted-foreground" />
              )}
              <p
                className={cn(
                  "text-sm font-semibold",
                  growth === null
                    ? "text-muted-foreground"
                    : growth >= 0
                      ? "text-emerald-600"
                      : "text-destructive"
                )}
              >
                {absoluteDiff >= 0 ? "+" : ""}
                {formatCurrency(absoluteDiff)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
