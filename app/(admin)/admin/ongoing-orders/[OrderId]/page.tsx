'use client'

import { use } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import Image from "next/image"
import toast from "react-hot-toast"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrderItems } from "../actions"
import { en } from "@/lib/i18n/en"
import { paymentStatusStyles } from "@/lib/color-objects"

export default function OrderItemsPage({ params }: {params: Promise<{ OrderId: string }>}) {
  const { OrderId } = use(params)
  const router = useRouter()

  const { data: order, isPending, isError, error } = useQuery({
    queryKey: ["order-items", OrderId],
    queryFn: async () => {
      const res = await getOrderItems(OrderId)
      if (!res.success) {
        throw new Error(res.error ?? en.failed_to_fetch_order_details)
      }
      return res.data
    },
    enabled: !!OrderId,
  })

  if (isError && error) {
    toast.error(error.message)
  }

  // Calculate total item quantity
  const totalQuantity = order?.orderItems?.reduce(
    (acc: number, item: any) => acc + item.quantity, 
    0
  ) ?? 0;

  return (
    <div className="flex flex-col gap-5 max-w-6xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-row items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-0.5">
          <h1 className="font-bold text-xl text-neutral-700 dark:text-neutral-200">
            Order Summary
          </h1>
          <p className="text-sm text-neutral-500">
            {isPending ? "Loading..." : `Order ${order?.orderNumber ?? ""}`}
          </p>
        </div>
      </div>

      {/* Order Details */}
      {!isPending && order && (
        <div className="border border-neutral-300 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-neutral-600 dark:text-neutral-300 text-center">
            Order Details
          </h2>

          <div className="flex flex-row flex-wrap gap-4">
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-neutral-500">Order Number</span>
              <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-neutral-500">Customer</span>
              <span className="text-sm">{order.user.firstName} {order.user.lastName}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-neutral-500">Email</span>
              <span className="text-sm">{order.user.email}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-neutral-500">Created Date</span>
              <span className="text-sm">{format(new Date(order.createdAt), "dd MMM yyyy")}</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-40">
              <span className="text-xs text-neutral-500">Payment Status</span>
              <span
                className={`border border-neutral-300 rounded-full px-3 py-1 text-xs font-medium w-fit ${paymentStatusStyles[order.paymentStatus] ?? "bg-neutral-100 text-neutral-800"}`}
              >
                {order.paymentStatus.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          <div className="flex flex-row flex-wrap gap-4 border-t border-neutral-200 pt-4">
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-neutral-500">Subtotal</span>
              <span className="text-sm">{Number(order.subtotal).toFixed(2)} LKR</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-neutral-500">Discount</span>
              <span className="text-sm text-red-500">{Number(order.discountAmount).toFixed(2)} LKR</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-neutral-500">Shipping</span>
              <span className="text-sm text-purple-500">{Number(order.shippingFee).toFixed(2)} LKR</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-neutral-500">Tax</span>
              <span className="text-sm text-yellow-500">{Number(order.taxAmount).toFixed(2)} LKR</span>
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-[120px]">
              <span className="text-xs text-neutral-500">Total</span>
              <span className="text-sm font-semibold text-green-500">{Number(order.totalAmount).toFixed(2)} LKR</span>
            </div>
          </div>

          {order.notes && (
            <div className="border-t border-neutral-200 pt-3">
              <span className="text-xs text-neutral-500">Notes</span>
              <p className="text-sm mt-1 text-neutral-700 dark:text-neutral-300">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Order Items Table */}
      <div className="border border-neutral-300 rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-neutral-600 dark:text-neutral-300 text-center">
          Order Items
        </h2>

        {isPending ? (
          <div className="flex justify-center items-center py-12 text-neutral-500 text-sm">
            Loading order items...
          </div>
        ) : !order?.orderItems?.length ? (
          <div className="flex flex-col justify-center items-center py-12 gap-2 text-neutral-500">
            <Package className="h-8 w-8" />
            <span className="text-sm">No order items found</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.orderItems.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.imageUrl ? (
                      <div className="relative h-30 w-30 rounded-md overflow-hidden border border-neutral-200">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="70px"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-semibold">{item.sku}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.productName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.sizeName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{item.colorName}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{item.quantity}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm">{Number(item.unitPrice).toFixed(2)} LKR</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm">{Number(item.discountAmount).toFixed(2)} LKR</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold">{Number(item.totalPrice).toFixed(2)} LKR</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}></TableCell>
                <TableCell>{totalQuantity} Items</TableCell>
                {/* <TableCell>Total</TableCell> */}
                <TableCell></TableCell>
                <TableCell className="text-right text-red-500">{Number(order.discountAmount).toFixed(2)} LKR</TableCell>
                <TableCell className="text-right text-green-500">{Number(order.totalAmount).toFixed(2)} LKR</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </div>
    </div>
  )
}
