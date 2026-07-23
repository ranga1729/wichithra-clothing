"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp } from "lucide-react"

interface KpiData {
  totalRevenue: number
  grossSales: number
  totalDiscounts: number
  taxesCollected: number
  aov: number
  revenueGrowth: number | null
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

interface SalesKpiCardsProps {
  kpis: KpiData
}

export default function SalesKpiCards({ kpis }: SalesKpiCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      change: kpis.revenueGrowth,
    },
    {
      title: "Gross Sales",
      value: formatCurrency(kpis.grossSales),
      change: null,
    },
    {
      title: "Discounts Given",
      value: formatCurrency(kpis.totalDiscounts),
      change: null,
    },
    {
      title: "Taxes Collected",
      value: formatCurrency(kpis.taxesCollected),
      change: null,
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(kpis.aov),
      change: null,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            {card.change !== null && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  card.change >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {card.change >= 0 ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {formatPercent(card.change)}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
