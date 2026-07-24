"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Package, ArrowRight } from "lucide-react"

import { getOrderHistory } from "../actions"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

interface Props {
  userId: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  RETURNED: "bg-gray-100 text-gray-800 border-gray-200",
  REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
}

export default function OrderHistoryTab({ userId }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orderHistory", userId],
    queryFn: () => getOrderHistory(userId),
  })

  const orders = data?.success ? data.data : []

  if (isLoading) return <OrderHistorySkeleton />
  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Failed to load orders.</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <Package className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No orders yet. Start shopping!</p>
          <Button asChild>
            <Link href="/search">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map((order: Record<string, unknown>) => {
        const orderId = order.id as string
        const shortId = orderId.slice(-8)
        const status = order.status as string
        const createdAt = order.createdAt as string
        const totalAmount = order.totalAmount as number
        const orderItems = order.orderItems as Array<unknown>

        return (
          <Link key={orderId} href={`/Orders/${orderId}`}>
            <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">Order #{shortId}</span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on: {new Date(createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Items: {orderItems.length} &middot; Total: LKR {Number(totalAmount).toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

function OrderHistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="py-4 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-40" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
