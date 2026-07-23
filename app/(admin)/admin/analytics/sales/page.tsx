"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { en } from "@/lib/i18n/en"
import { SalesFilter } from "@/schemas/analytics-schema"
import { getSalesAnalytics } from "./actions"
import SalesDateFilter from "@/components/custom/admin/analytics/sales-date-filter"
import SalesKpiCards from "@/components/custom/admin/analytics/sales-kpi-cards"
import SalesRevenueChart from "@/components/custom/admin/analytics/sales-revenue-chart"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import toast from "react-hot-toast"

const defaultFilter: SalesFilter = {
  preset: "last30days",
  dateFrom: undefined,
  dateTo: undefined,
}

export default function SalesAnalyticsPage() {
  const [filter, setFilter] = useState<SalesFilter>(defaultFilter)

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["analytics", "sales", filter],
    queryFn: async () => {
      const response = await getSalesAnalytics(filter)
      if (!response.success) {
        throw new Error(response.error || en.failed_to_fetch_data)
      }
      return response.data
    },
    placeholderData: (prevData) => prevData,
  })

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message)
    }
  }, [error, isError])

  return (
    <div className="flex flex-col gap-4">
      <Item variant="muted">
        <ItemContent>
          <ItemTitle className="text-2xl">Sales Analytics</ItemTitle>
          <ItemDescription className="whitespace-normal line-clamp-none">
            Track revenue, orders, and key performance metrics over time.
          </ItemDescription>
        </ItemContent>
      </Item>

      <SalesDateFilter filter={filter} onFilterChange={setFilter} />

      {isPending && !data ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full" />
            </CardContent>
          </Card>
        </div>
      ) : data ? (
        <>
          <SalesKpiCards kpis={data.kpis} />
          <SalesRevenueChart data={data.chartData} />
        </>
      ) : null}
    </div>
  )
}
