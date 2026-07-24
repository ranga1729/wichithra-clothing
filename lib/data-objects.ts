import { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums"

export const paymentStatusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-blue-100 text-blue-800",
  PARTIALLY_REFUNDED: "bg-purple-100 text-purple-800",
}

export const PAYMENT_STATUS_OPTIONS = [
  { label: "Pending", value: PaymentStatus.PENDING },
  { label: "Completed", value: PaymentStatus.COMPLETED },
  { label: "Failed", value: PaymentStatus.FAILED },
  { label: "Refunded", value: PaymentStatus.REFUNDED },
  { label: "Partially Refunded", value: PaymentStatus.PARTIALLY_REFUNDED },
]

export const paymentMethodStyles: Record<string, string> = {
  CARD: "bg-blue-100 text-blue-800",
  BANK_TRANSFER: "bg-green-100 text-green-800",
  CASH_ON_DELIVERY: "bg-yellow-100 text-yellow-800",
  PAYHERE: "bg-purple-100 text-purple-800",
  OTHER: "bg-neutral-100 text-neutral-800",
}

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Card", value: PaymentMethod.CARD },
  { label: "Bank Transfer", value: PaymentMethod.BANK_TRANSFER },
  { label: "Cash on Delivery", value: PaymentMethod.CASH_ON_DELIVERY },
  { label: "PayHere", value: PaymentMethod.PAYHERE },
  { label: "Other", value: PaymentMethod.OTHER },
]

export const orderStatusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
  REFUNDED: "bg-gray-100 text-gray-800",
}