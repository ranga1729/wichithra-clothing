'use server'

import { en } from "@/lib/i18n/en"
import { notDeleted, prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth-guard"
import { checkout_schema, ShippingAddress } from "@/schemas/shop-schemas"
import { ApiResponse } from "@/types/auth-types"
import { Prisma } from "@/generated/prisma/client"
import { PaymentMethod, PaymentStatus, OrderStatus, StockMovementType } from "@/generated/prisma/enums"

interface CartItemInput {
  variantId: string
  quantity: number
}

interface PlaceOrderResult {
  orderId: string
  orderNumber: string
}

async function generateOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `WC-${year}`

  const lastOrder = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  })

  if (!lastOrder) {
    return `${prefix}0001`
  }

  const lastSeq = parseInt(lastOrder.orderNumber.replace(prefix, ""), 10)
  const nextSeq = (isNaN(lastSeq) ? 0 : lastSeq) + 1
  return `${prefix}${String(nextSeq).padStart(4, "0")}`
}

export async function placeOrder(
  cartItems: CartItemInput[],
  shippingAddress: ShippingAddress,
  payment: { cardNumber: string; expiryDate: string; cvv: string }
): Promise<ApiResponse<PlaceOrderResult>> {
  try {
    const payload = await requireAuth()
    const userId = payload.userId

    const parsed = checkout_schema.safeParse({
      shippingAddress,
      payment,
    })

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? en.validation_failed,
      }
    }

    if (!cartItems.length) {
      return { success: false, error: en.cart_is_empty }
    }

    const result = await prisma.$transaction(async (tx) => {
      const orderNumber = await generateOrderNumber(tx)

      const variantIds = cartItems.map((i) => i.variantId)
      const variants = await tx.productVariant.findMany({
        where: {
          id: { in: variantIds },
          ...notDeleted,
          isActive: true,
        },
        include: {
          product: true,
          color: true,
          inventory: true,
        },
      })

      if (variants.length !== cartItems.length) {
        throw new Error("One or more products are no longer available.")
      }

      let subtotal = new Prisma.Decimal(0)
      let discountAmount = new Prisma.Decimal(0)

      const orderItemsData: Prisma.OrderItemCreateManyInput[] = []

      for (const cartItem of cartItems) {
        const variant = variants.find((v) => v.id === cartItem.variantId)
        if (!variant || !variant.inventory) {
          throw new Error(`Variant ${cartItem.variantId} is not available.`)
        }

        const available = variant.inventory.quantity - variant.inventory.reservedQuantity
        if (available < cartItem.quantity) {
          throw new Error(
            `Insufficient stock for ${variant.product.name} (${variant.color.name}, ${variant.size}). Available: ${available}, requested: ${cartItem.quantity}.`
          )
        }

        const unitPrice = Number(variant.product.sellingPrice)
        const originalPrice = Number(variant.product.costPrice)
        const lineTotal = unitPrice * cartItem.quantity
        const lineDiscount = (originalPrice > 0 ? originalPrice - unitPrice : 0) * cartItem.quantity

        subtotal = subtotal.add(new Prisma.Decimal(lineTotal))
        discountAmount = discountAmount.add(new Prisma.Decimal(Math.max(0, lineDiscount)))

        const primaryImage = await tx.productImage.findFirst({
          where: {
            productId: variant.productId,
            isPrimary: true,
            ...notDeleted,
          },
          select: { imageUrl: true },
        })

        orderItemsData.push({
          inventoryId: variant.inventory.id,
          variantId: variant.id,
          productId: variant.productId,
          sku: variant.sku,
          productName: variant.product.name,
          productSlug: variant.product.slug,
          categoryName: "Uncategorized",
          categorySlug: "uncategorized",
          sizeName: variant.size,
          colorName: variant.color.name,
          colorHexCode: variant.color.hexCode,
          swatchImageUrl: variant.color.swatchImageUrl,
          brandName: variant.product.brand,
          primaryImageUrl: primaryImage?.imageUrl ?? null,
          quantity: cartItem.quantity,
          unitPrice: unitPrice,
          gender: variant.product.gender,
          ageGroup: variant.product.ageGroup,
          discountAmount: Math.max(0, lineDiscount),
          totalPrice: lineTotal,
        })
      }

      const shippingFee = new Prisma.Decimal(0)
      const taxAmount = new Prisma.Decimal(0)
      const totalAmount = subtotal.add(shippingFee).add(taxAmount)

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal,
          discountAmount,
          shippingFee,
          taxAmount,
          totalAmount,
        },
      })

      await tx.orderItem.createMany({
        data: orderItemsData.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      })

      await tx.orderAddress.create({
        data: {
          orderId: order.id,
          type: "DELIVERY",
          houseNo: shippingAddress.houseNo,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2 ?? null,
          city: shippingAddress.city,
          province: shippingAddress.province,
          zipcode: shippingAddress.zipCode,
          country: shippingAddress.country,
        },
      })

      await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          currency: "LKR",
          method: PaymentMethod.CARD,
          status: PaymentStatus.COMPLETED,
          gatewayProvider: "demo",
          gatewayTransactionId: `DEMO-${Date.now()}`,
          paidAt: new Date(),
        },
      })

      for (const cartItem of cartItems) {
        const variant = variants.find((v) => v.id === cartItem.variantId)
        if (!variant?.inventory) continue

        await tx.inventory.update({
          where: { id: variant.inventory.id },
          data: {
            quantity: {
              decrement: cartItem.quantity,
            },
          },
        })

        await tx.stockMovement.create({
          data: {
            inventoryId: variant.inventory.id,
            movementType: StockMovementType.OUT,
            quantity: cartItem.quantity,
            reason: "Order placed",
            referenceId: order.id,
            createdBy: userId,
          },
        })
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PENDING,
          notes: "Order placed",
        },
      })

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.COMPLETED,
        },
      })

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          notes: "Payment confirmed",
        },
      })

      return { orderId: order.id, orderNumber: order.orderNumber }
    })

    return {
      success: true,
      data: result,
      message: en.order_placed_successfully,
    }
  } catch (error: unknown) {
    console.error("Place order error:", error)
    const message = error instanceof Error ? error.message : en.something_went_wrong
    return { success: false, error: message }
  }
}

export async function getUserAddress(): Promise<ApiResponse<ShippingAddress | null>> {
  try {
    const payload = await requireAuth()

    const address = await prisma.address.findFirst({
      where: {
        userId: payload.userId,
        isDefault: true,
        type: "DELIVERY",
      },
      select: {
        houseNo: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        province: true,
        zipcode: true,
        country: true,
      },
    })

    if (!address) {
      return { success: true, data: null }
    }

    return {
      success: true,
      data: {
        houseNo: address.houseNo,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 ?? undefined,
        city: address.city,
        province: address.province,
        zipCode: address.zipcode,
        country: address.country,
      },
    }
  } catch (error: unknown) {
    console.error("Get user address error:", error)
    return { success: true, data: null }
  }
}
