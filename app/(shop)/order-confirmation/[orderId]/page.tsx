'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Loader2, CheckCircle2, Shirt } from 'lucide-react'
import { getOrderConfirmation } from '@/app/(shop)/order-confirmation/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { en } from '@/lib/i18n/en'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params?.orderId as string | undefined

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order-confirmation', orderId],
    queryFn: () => getOrderConfirmation(orderId!),
    enabled: !!orderId,
  })

  const order = data?.success ? data.data : null

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">{data?.error ?? en.order_not_found}</p>
        <Link href="/">
          <Button variant="outline">{en.continue_shopping}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 lg:text-3xl">
          {en.order_confirmation_title}
        </h1>
        <p className="max-w-md text-neutral-500">
          {en.order_confirmation_message}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{en.order_number}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-neutral-900">{order.orderNumber}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{en.order_summary}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  {item.primaryImageUrl ? (
                    <Image
                      src={item.primaryImageUrl}
                      alt={item.productName}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-neutral-400">
                      <Shirt className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {item.productName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.sizeName} / {item.colorName}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </span>
                </div>
                <span className="text-sm font-medium whitespace-nowrap">
                  Rs {item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}

            <Separator className="my-2" />

            <div className="flex justify-between text-base font-semibold">
              <span>{en.total}</span>
              <span>Rs {order.totalAmount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{en.shipping_details}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600">
                {order.shippingAddress.houseNo}, {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 &&
                  `, ${order.shippingAddress.addressLine2}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                {order.shippingAddress.zipcode}
                <br />
                {order.shippingAddress.country}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Continue Shopping */}
        <div className="flex justify-center pt-4">
          <Link href="/">
            <Button size="lg" variant="outline">
              {en.continue_shopping}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
