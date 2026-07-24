"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart, Cell, Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { format } from "date-fns"

interface BreakdownProps {
  breakdown: {
    grossSales: number
    discounts: number
    taxes: number
    netRevenue: number
  }
  dailyData: { date: string; revenue: number; orders: number }[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const donutConfig = {
  grossSales: { label: "Gross Sales", color: "#3b82f6" },
  discounts: { label: "Discounts", color: "#f97316" },
  taxes: { label: "Tax", color: "#a855f7" },
  netRevenue: { label: "Net Revenue", color: "#10b981" },
} satisfies ChartConfig

const barConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig

export default function SalesBreakdownCharts({
  breakdown,
  dailyData,
}: BreakdownProps) {
  const donutData = [
    { name: "Net Revenue", value: breakdown.netRevenue, fill: donutConfig.netRevenue.color },
    { name: "Discounts", value: breakdown.discounts, fill: donutConfig.discounts.color },
    { name: "Tax", value: breakdown.taxes, fill: donutConfig.taxes.color },
  ].filter((d) => d.value > 0)

  const barData = dailyData.map((d) => ({
    label: format(new Date(d.date), "MMM dd"),
    revenue: d.revenue,
    orders: d.orders,
    aov: d.orders > 0 ? d.revenue / d.orders : 0,
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Revenue Composition
          </CardTitle>
        </CardHeader>
        <CardContent>
          {donutData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="h-[220px] w-[220px] shrink-0">
                <ChartContainer config={donutConfig} className="h-full w-full">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="flex flex-col gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Net Revenue</p>
                  <p className="text-lg font-bold">{formatCurrency(breakdown.netRevenue)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {donutData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-xs text-muted-foreground">{item.name}</span>
                      <span className="text-xs font-medium ml-auto">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Revenue by Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length > 0 ? (
            <ChartContainer config={barConfig} className="h-[280px] w-full">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="label"
                      formatter={(value, name) => {
                        if (name === "revenue") return formatCurrency(value as number)
                        return String(value)
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
