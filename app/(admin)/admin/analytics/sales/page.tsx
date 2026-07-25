"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { en } from "@/lib/i18n/en"
import { SalesFilter } from "@/schemas/analytics-schema"
import { getSalesAnalytics } from "./actions"
import type { SalesAnalyticsData } from "./actions"
import SalesDateFilter from "@/components/custom/admin/analytics/sales-date-filter"
import SalesKpiCards from "@/components/custom/admin/analytics/sales-kpi-cards"
import SalesRevenueChart from "@/components/custom/admin/analytics/sales-revenue-chart"
import SalesBreakdownCharts from "@/components/custom/admin/analytics/sales-breakdown-charts"
import SalesComparisonChart from "@/components/custom/admin/analytics/sales-comparison-chart"
import SalesInsightCards from "@/components/custom/admin/analytics/sales-insight-cards"
import SalesPerformanceSummary from "@/components/custom/admin/analytics/sales-performance-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"

const defaultFilter: SalesFilter = {
  preset: "last30days",
  dateFrom: undefined,
  dateTo: undefined,
  comparison: "previousPeriod",
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-7 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[420px] w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No Sales Data Yet</h3>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Sales analytics will appear here once your store receives completed
        orders.
      </p>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Something went wrong</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}

export default function SalesAnalyticsPage() {
  const [filter, setFilter] = useState<SalesFilter>(defaultFilter)

  const { data, isPending, error, isError, refetch, isFetching } = useQuery({
    queryKey: ["analytics", "sales", filter],
    queryFn: async () => {
      const response = await getSalesAnalytics(filter)
      if (!response.success) {
        throw new Error(response.error || en.failed_to_fetch_data)
      }
      return response.data as SalesAnalyticsData
    },
    placeholderData: (prevData) => prevData,
  })

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message)
    }
  }, [error, isError])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Sales Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor revenue, sales performance, discounts, taxes, and order
            value over time.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <SalesDateFilter filter={filter} onFilterChange={setFilter} />

      {isPending && !data ? (
        <LoadingSkeleton />
      ) : isError ? (
        <ErrorState
          message={error?.message ?? "Failed to load analytics"}
          onRetry={() => refetch()}
        />
      ) : data && !data.hasData ? (
        <EmptyState />
      ) : data ? (
        <>
          <SalesKpiCards kpis={data.kpis} chartData={data.chartData} />

          <SalesRevenueChart data={data.chartData} />

          <SalesBreakdownCharts
            breakdown={data.breakdown}
            dailyData={data.chartData}
          />

          <SalesComparisonChart comparison={data.comparison} />

          <SalesInsightCards kpis={data.kpis} insights={data.insights} />

          <SalesPerformanceSummary kpis={data.kpis} insights={data.insights} />
        </>
      ) : null}
    </div>
  )
}
