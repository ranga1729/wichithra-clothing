import { PaymentStatus } from "@/generated/prisma/enums"

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