'use server'

import { en } from "@/lib/i18n/en"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth-guard"
import { ApiResponse } from "@/types/auth-types"

export interface OrderConfirmationData {
  orderId: string
  orderNumber: string
  status: string
  paymentStatus: string
  totalAmount: number
  createdAt: string
  items: {
    productName: string
    sizeName: string
    colorName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    primaryImageUrl: string | null
  }[]
  shippingAddress: {
    houseNo: string
    addressLine1: string
    addressLine2: string | null
    city: string
    province: string
    zipcode: string
    country: string
  } | null
}

export async function getOrderConfirmation(
  orderId: string
): Promise<ApiResponse<OrderConfirmationData>> {
  try {
    const payload = await requireAuth()

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: payload.userId,
      },
      include: {
        orderItems: {
          select: {
            productName: true,
            sizeName: true,
            colorName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            primaryImageUrl: true,
          },
        },
        orderAddresses: {
          where: { type: "DELIVERY" },
          select: {
            houseNo: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            province: true,
            zipcode: true,
            country: true,
          },
          take: 1,
        },
      },
    })

    if (!order) {
      return { success: false, error: en.order_not_found }
    }

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt.toISOString(),
        items: order.orderItems.map((item) => ({
          productName: item.productName,
          sizeName: item.sizeName,
          colorName: item.colorName,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          primaryImageUrl: item.primaryImageUrl,
        })),
        shippingAddress: order.orderAddresses[0] ?? null,
      },
    }
  } catch (error: unknown) {
    console.error("Get order confirmation error:", error)
    const message = error instanceof Error ? error.message : en.something_went_wrong
    return { success: false, error: message }
  }
}
