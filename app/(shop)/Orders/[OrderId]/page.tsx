"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { getOrderDetail } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Props {
  params: Promise<{ OrderId: string }>
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

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
  PARTIALLY_REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
}

export default function OrderDetailPage({ params }: Props) {
  const { OrderId: orderId } = use(params)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["orderDetail", orderId],
    queryFn: () => getOrderDetail(orderId),
  })

  const order = data?.success ? data.data : null

  if (isLoading) return <OrderDetailSkeleton />
  if (isError || !order) {
    return (
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">Order not found.</p>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  const shortId = (order.id as string).slice(-8)
  const status = order.status as string
  const createdAt = order.createdAt as string
  const totalAmount = order.totalAmount as number
  const orderItems = order.orderItems as Array<Record<string, unknown>>
  const statusHistory = order.orderStatusHistory as Array<Record<string, unknown>>
  const payments = order.payments as Array<Record<string, unknown>>
  const latestPayment = payments.length > 0 ? payments[0] : null

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <Link
        href={`/user-dashboard/${order.userId as string}?tab=orders`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" /> Back to My Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Order #{shortId}</h1>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
          {status}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        Placed on: {new Date(createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Items in This Order</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderItems.map((item) => (
            <div key={item.id as string} className="rounded-md border p-4 space-y-1">
              <p className="font-medium">{item.productName as string}</p>
              <p className="text-sm text-muted-foreground">
                SKU: {item.sku as string} &middot; Size: {item.sizeName as string} &middot; Color: {item.colorName as string}
              </p>
              <p className="text-sm text-muted-foreground">
                Qty: {item.quantity as number} &middot; Unit price: LKR {Number(item.unitPrice).toLocaleString()}
              </p>
            </div>
          ))}

          <Separator className="my-4" />

          <div className="flex items-center justify-between font-semibold">
            <span>Order Total</span>
            <span>LKR {Number(totalAmount).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {statusHistory.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Status History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4 pl-4 border-l-2 border-border">
              {statusHistory.map((entry) => (
                <div key={entry.id as string} className="relative">
                  <div className="absolute -left-[1.35rem] top-1 size-2.5 rounded-full bg-border" />
                  <p className="text-sm">
                    <span className="font-medium">{entry.status as string}</span>
                    {entry.notes ? <span className="text-muted-foreground ml-2">&mdash; {entry.notes as string}</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.createdAt as string).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {latestPayment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_COLORS[latestPayment.status as string] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
                {latestPayment.status as string}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Method: {(latestPayment.method as string) ?? "\u2014"}
            </p>
            <p className="text-sm text-muted-foreground">
              Paid at: {latestPayment.paidAt ? new Date(latestPayment.paidAt as string).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" }) : "Pending"}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

function OrderDetailSkeleton() {
  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <Skeleton className="h-4 w-36 mb-6" />
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-56 mb-8" />
      <Card className="mb-6">
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
