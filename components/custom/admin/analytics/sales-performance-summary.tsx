"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle2,
  AlertCircle,
  Minus,
} from "lucide-react"

interface PerformanceSummaryProps {
  kpis: {
    totalRevenue: { value: number; growth: number | null }
    grossSales: { value: number; growth: number | null }
    totalDiscounts: { value: number; growth: number | null }
    taxesCollected: { value: number; growth: number | null }
    aov: { value: number; growth: number | null }
  }
  insights: {
    discountRate: number
    taxRate: number
    revenuePerDay: number
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

interface Insight {
  text: string
  type: "positive" | "negative" | "neutral"
}

export default function SalesPerformanceSummary({
  kpis,
  insights,
}: PerformanceSummaryProps) {
  const items: Insight[] = []

  if (kpis.totalRevenue.growth !== null) {
    const dir = kpis.totalRevenue.growth >= 0 ? "increased" : "decreased"
    items.push({
      text: `Revenue ${dir} by ${Math.abs(kpis.totalRevenue.growth).toFixed(1)}% compared to the previous period, totaling ${formatCurrency(kpis.totalRevenue.value)}.`,
      type: kpis.totalRevenue.growth >= 0 ? "positive" : "negative",
    })
  }

  if (kpis.aov.growth !== null) {
    items.push({
      text: `Average order value ${kpis.aov.growth >= 0 ? "continues to rise" : "has declined"} at ${formatCurrency(kpis.aov.value)} per order.`,
      type: kpis.aov.growth >= 0 ? "positive" : "negative",
    })
  }

  if (insights.discountRate > 0) {
    const stable = insights.discountRate < 15
    items.push({
      text: `Discount spending is at ${insights.discountRate.toFixed(1)}% of gross sales${stable ? ", remaining within healthy bounds" : ", which may warrant attention"}.`,
      type: stable ? "neutral" : "negative",
    })
  }

  if (kpis.taxesCollected.growth !== null) {
    items.push({
      text: `Tax collection ${kpis.taxesCollected.growth >= 0 ? "increased" : "decreased"} alongside revenue, reaching ${formatCurrency(kpis.taxesCollected.value)}.`,
      type: "neutral",
    })
  }

  const healthyGrowth =
    kpis.totalRevenue.growth !== null &&
    kpis.totalRevenue.growth > 0 &&
    kpis.totalRevenue.growth < 100
  items.push({
    text: healthyGrowth
      ? "Revenue growth appears healthy and consistent."
      : kpis.totalRevenue.growth === null
        ? "No comparable data for growth assessment."
        : "Revenue growth is outside typical range — review may be needed.",
    type: healthyGrowth ? "positive" : "neutral",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Performance Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              {item.type === "positive" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              ) : item.type === "negative" ? (
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
              ) : (
                <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
