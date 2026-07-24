"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import { format } from "date-fns"

interface ChartDataPoint {
  date: string
  revenue: number
  grossSales: number
  discounts: number
}

interface SalesRevenueChartProps {
  data: ChartDataPoint[]
}

const chartConfig = {
  grossSales: {
    label: "Gross Sales",
    color: "var(--chart-2)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  discounts: {
    label: "Discounts",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function SalesRevenueChart({ data }: SalesRevenueChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), "MMM dd"),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Revenue Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[420px] w-full"
        >
          <AreaChart
            data={formatted}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillGrossSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-grossSales)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-grossSales)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillDiscounts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-discounts)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-discounts)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value: number) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) => formatCurrency(value as number)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="grossSales"
              stroke="var(--color-grossSales)"
              fill="url(#fillGrossSales)"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="url(#fillRevenue)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="discounts"
              stroke="var(--color-discounts)"
              fill="url(#fillDiscounts)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
