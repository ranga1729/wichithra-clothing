'use client'

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import ProductRow from '@/components/custom/shop/product-row'
import toast from "react-hot-toast"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrderItems } from "../actions"
import { en } from "@/lib/i18n/en"
import { paymentStatusStyles } from "@/lib/data-objects"
import { useBreadcrumbStore } from "@/lib/zustand-stores/use-breadcrum-store"

export default function OrderItemsPage({ params }: {params: Promise<{ OrderId: string }>}) {
  const { OrderId } = use(params)
  const router = useRouter()
  const setDynamicLabel = useBreadcrumbStore((state) => state.setDynamicLabel)

  const { data: order, isPending, isError, error } = useQuery({
    queryKey: ["order-items", OrderId],
    queryFn: async () => {
      const res = await getOrderItems(OrderId)
      if (!res.success) {
        throw new Error(res.error ?? en.failed_to_load_order_details)
      }
      return res.data
    },
    enabled: !!OrderId,
  })

  if (isError && error) {
    toast.error(error.message)
  }

  useEffect(() => {
    if(order?.orderNumber) {
      setDynamicLabel(order.orderNumber)
    }
  })

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-row items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold text-xl text-foreground">
            Order Summary
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPending ? "Loading..." : `Order ${order?.orderNumber ?? ""}`}
          </p>
        </div>
      </div>

      {/* Order Details */}
      {!isPending && order && (
        <div className="border border-border bg-card rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-foreground text-center">
            Order Details
          </h2>

          <div className="flex flex-row flex-wrap gap-4">
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-muted-foreground">Order Number</span>
              <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-muted-foreground">Customer</span>
              <span className="text-sm">{order.user.firstName} {order.user.lastName}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm">{order.user.email}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-muted-foreground">Created Date</span>
              <span className="text-sm">{format(new Date(order.createdAt), "dd MMM yyyy")}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-muted-foreground">Payment Status</span>
              <span
                className={`border border-border rounded-full px-3 py-1 text-xs font-medium w-fit ${paymentStatusStyles[order.paymentStatus] ?? "bg-muted text-muted-foreground"}`}
              >
                {order.paymentStatus.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="flex flex-row flex-wrap gap-4 border-t border-border pt-4">
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-muted-foreground">Subtotal</span>
              <span className="text-sm">{Number(order.subtotal).toFixed(2)} LKR</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-muted-foreground">Discount</span>
              <span className="text-sm text-destructive">{Number(order.discountAmount).toFixed(2)} LKR</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-muted-foreground">Shipping</span>
              <span className="text-sm text-purple-500">{Number(order.shippingFee).toFixed(2)} LKR</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-muted-foreground">Tax</span>
              <span className="text-sm text-yellow-500">{Number(order.taxAmount).toFixed(2)} LKR</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-semibold text-emerald-600">{Number(order.totalAmount).toFixed(2)} LKR</span>
            </div>
          </div>

          {order.notes && (
            <div className="border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Notes</span>
              <p className="text-sm mt-1 text-foreground">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Order Items Table */}
      <div className="border border-border bg-card rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-foreground text-center">
          Order Items
        </h2>

        {isPending ? (
          <div className="flex justify-center items-center py-12 text-muted-foreground text-sm">
            Loading order items...
          </div>
        ) : !order?.orderItems?.length ? (
          <div className="flex flex-col justify-center items-center py-12 gap-2 text-muted-foreground">
            <Package className="h-8 w-8" />
            <span className="text-sm">No order items found</span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {order.orderItems.map((item: any) => (
              <ProductRow
                key={item.id}
                item={{
                  imageUrl: item.primaryImageUrl,
                  productName: item.productName,
                  categoryName: item.categoryName,
                  sizeName: item.sizeName,
                  colorName: item.colorName,
                  colorHexCode: item.colorHexCode,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  totalPrice: item.totalPrice,
                  productSlug: item.productSlug,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
