'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldCheck, Shirt } from 'lucide-react'
import { useCartStore } from '@/lib/zustand-stores/cart-store'
import { placeOrder, getUserAddress } from '@/app/(shop)/billing/actions'
import {
  checkout_schema,
  shipping_address_schema,
  type CheckoutForm,
  type ShippingAddress,
} from '@/schemas/shop-schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { en } from '@/lib/i18n/en'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function BillingPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice)
  const clearCart = useCartStore((s) => s.clearCart)
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: userAddress, isLoading: addressLoading } = useQuery({
    queryKey: ['user-address'],
    queryFn: getUserAddress,
  })

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkout_schema),
    mode: 'onChange',
    defaultValues: {
      shippingAddress: {
        houseNo: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        province: '',
        zipCode: '',
        country: 'Sri Lanka',
      },
      payment: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      },
    },
  })

  useEffect(() => {
    if (userAddress?.success && userAddress.data) {
      const addr = userAddress.data
      form.reset({
        shippingAddress: {
          houseNo: addr.houseNo,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2 ?? '',
          city: addr.city,
          province: addr.province,
          zipCode: addr.zipCode,
          country: addr.country,
        },
        payment: {
          cardNumber: '',
          expiryDate: '',
          cvv: '',
        },
      })
    }
  }, [userAddress, form])

  const { mutate: submitOrder } = useMutation({
    mutationFn: (data: CheckoutForm) =>
      placeOrder(
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        data.shippingAddress,
        data.payment,
      ),
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success(result.message ?? en.order_placed_successfully)
        clearCart()
        router.push(`/order-confirmation/${result.data.orderId}`)
      } else {
        toast.error(result.error ?? en.order_failed)
        setIsProcessing(false)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.order_failed)
      setIsProcessing(false)
    },
  })

  const onSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error(en.fill_all_required_fileds)
      return
    }
    if (items.length === 0) {
      toast.error(en.cart_is_empty)
      return
    }
    setIsProcessing(true)
    submitOrder(form.getValues())
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 16)
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }
    return digits
  }

  const formatCvv = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4)
  }

  const cartTotal = totalPrice()
  const itemDiscount = items.reduce(
    (sum, i) => sum + (i.quantity > 1 ? 0 : 0),
    0,
  )

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 py-10">
        <p className="text-neutral-500">{en.cart_is_empty}</p>
        <Link href="/">
          <Button variant="outline">{en.continue_shopping}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-neutral-900 lg:text-3xl">
        {en.checkout_title}
      </h1>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Left: Forms */}
        <div className="flex w-full flex-col gap-6 lg:w-[60%]">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{en.shipping_address}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {addressLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="houseNo">{en.house_number_required}</Label>
                    <Input
                      id="houseNo"
                      placeholder="No. 123"
                      {...form.register('shippingAddress.houseNo')}
                    />
                    {form.formState.errors.shippingAddress?.houseNo && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.shippingAddress.houseNo.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="city">{en.nearest_city_required}</Label>
                    <Input
                      id="city"
                      placeholder="Colombo"
                      {...form.register('shippingAddress.city')}
                    />
                    {form.formState.errors.shippingAddress?.city && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.shippingAddress.city.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="addressLine1">{en.address_line_1_required}</Label>
                    <Input
                      id="addressLine1"
                      placeholder="Main Street"
                      {...form.register('shippingAddress.addressLine1')}
                    />
                    {form.formState.errors.shippingAddress?.addressLine1 && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.shippingAddress.addressLine1.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="addressLine2">{en.address_line_2_required}</Label>
                    <Input
                      id="addressLine2"
                      placeholder="Apartment, suite, etc."
                      {...form.register('shippingAddress.addressLine2')}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="province">{en.province_required}</Label>
                    <Input
                      id="province"
                      placeholder="Western"
                      {...form.register('shippingAddress.province')}
                    />
                    {form.formState.errors.shippingAddress?.province && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.shippingAddress.province.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="zipCode">{en.zipcode_required}</Label>
                    <Input
                      id="zipCode"
                      placeholder="00100"
                      {...form.register('shippingAddress.zipCode')}
                    />
                    {form.formState.errors.shippingAddress?.zipCode && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.shippingAddress.zipCode.message}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {en.payment_details}
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-md bg-blue-50 px-4 py-2 text-xs text-blue-700">
                {en.demo_payment_notice}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cardNumber">{en.card_number}</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    {...form.register('payment.cardNumber', {
                      onChange: (e) => {
                        e.target.value = formatCardNumber(e.target.value)
                      },
                    })}
                  />
                  {form.formState.errors.payment?.cardNumber && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.payment.cardNumber.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="expiryDate">{en.expiry_date}</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      maxLength={5}
                      {...form.register('payment.expiryDate', {
                        onChange: (e) => {
                          e.target.value = formatExpiry(e.target.value)
                        },
                      })}
                    />
                    {form.formState.errors.payment?.expiryDate && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.expiryDate?.message ??
                          form.formState.errors.payment?.expiryDate?.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cvv">{en.cvv}</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      maxLength={4}
                      type="password"
                      {...form.register('payment.cvv', {
                        onChange: (e) => {
                          e.target.value = formatCvv(e.target.value)
                        },
                      })}
                    />
                    {form.formState.errors.payment?.cvv && (
                      <p className="text-xs text-red-600">
                        {form.formState.errors.payment.cvv.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Order Summary */}
        <div className="flex w-full flex-col gap-6 lg:w-[40%]">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">{en.order_summary}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
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
                        {item.size} / {item.color.name}
                        {item.quantity > 1 && ` × ${item.quantity}`}
                      </span>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      Rs {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{en.subtotal}</span>
                  <span>Rs {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{en.shipping_fee}</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{en.tax}</span>
                  <span>Rs 0.00</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-semibold">
                <span>{en.total}</span>
                <span>Rs {cartTotal.toFixed(2)}</span>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                onClick={onSubmit}
                disabled={isProcessing || items.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {en.processing_order}
                  </>
                ) : (
                  en.place_order
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
