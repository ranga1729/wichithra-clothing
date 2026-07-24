"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingUp,
  BadgePercent,
  Receipt,
  CalendarDays,
  Trophy,
  Crown,
} from "lucide-react"
import { format } from "date-fns"

interface InsightCardsProps {
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
    bestDay: { date: string; revenue: number; orders: number } | null
    highestAovDay: { date: string; aov: number; revenue: number } | null
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

function ProgressRing({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100)
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <svg width="68" height="68" className="shrink-0">
      <circle
        cx="34"
        cy="34"
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-muted/50"
        strokeWidth="5"
      />
      <circle
        cx="34"
        cy="34"
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
      />
      <text
        x="34"
        y="34"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-[11px] font-semibold"
      >
        {value.toFixed(0)}%
      </text>
    </svg>
  )
}

export default function SalesInsightCards({ kpis, insights }: InsightCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue Growth</p>
              <p className="text-lg font-bold">
                {kpis.totalRevenue.growth !== null
                  ? `${kpis.totalRevenue.growth >= 0 ? "+" : ""}${kpis.totalRevenue.growth.toFixed(1)}%`
                  : "—"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Compared to previous period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50">
              <BadgePercent className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Discount Rate</p>
              <p className="text-lg font-bold">
                {insights.discountRate.toFixed(1)}%
              </p>
            </div>
            <ProgressRing value={insights.discountRate} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Discounts ÷ Gross Sales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50">
              <Receipt className="size-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Tax Contribution</p>
              <p className="text-lg font-bold">
                {insights.taxRate.toFixed(1)}%
              </p>
            </div>
            <ProgressRing value={insights.taxRate} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Tax ÷ Gross Sales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50">
              <CalendarDays className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue Per Day</p>
              <p className="text-lg font-bold">
                {formatCurrency(insights.revenuePerDay)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Average daily revenue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50">
              <Trophy className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Sales Day</p>
              {insights.bestDay ? (
                <>
                  <p className="text-lg font-bold">
                    {formatCurrency(insights.bestDay.revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(insights.bestDay.date), "MMM dd, yyyy")} ·{" "}
                    {insights.bestDay.orders} orders
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold">—</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
              <Crown className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Highest AOV Day
              </p>
              {insights.highestAovDay ? (
                <>
                  <p className="text-lg font-bold">
                    {formatCurrency(insights.highestAovDay.aov)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(insights.highestAovDay.date), "MMM dd, yyyy")} ·{" "}
                    {formatCurrency(insights.highestAovDay.revenue)} total
                  </p>
                </>
              ) : (
                <p className="text-lg font-bold">—</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
