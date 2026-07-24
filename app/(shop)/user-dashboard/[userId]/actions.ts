"use server"

import { AuthError, requireAuth, requireRole } from "@/lib/server-auth-guard"
import { notDeleted, prisma } from "@/lib/prisma"
import { updateProfileSchema, phoneSchema, addressSchema } from "@/schemas/shop-schemas"
import { revalidatePath } from "next/cache"
import type { ApiResponse } from "@/types/auth-types"

export async function getUserProfile(userId: string): Promise<ApiResponse> {
  try {
    await requireAuth();
    await requireRole(["admin", "super-admin", "customer"]);

    const user = await prisma.user.findFirst({
      where: { id: userId, ...notDeleted },
      include: {
        phoneNumbers: true,
        addresses: true,
      },
    })

    if (!user) return { 
      success: false, error: 
      "User not found" 
    }

    return { 
      success: true, 
      data: user 
    }
  } catch(error) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "server error",
    };
  }
}

export async function updateProfile(userId: string, input: unknown): Promise<ApiResponse> {
  await requireAuth();
  await requireRole(["admin", "super-admin", "customer"]);
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.message }
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { firstName: parsed.data.firstName, lastName: parsed.data.lastName },
    })
    revalidatePath(`/user-dashboard/${userId}`)
    return { success: true }
  } catch {
    return { success: false, error: "update_failed" }
  }
}

export async function upsertPhone(userId: string, input: unknown): Promise<ApiResponse> {
  await requireAuth();
  await requireRole(["admin", "super-admin", "customer"]);
  const parsed = phoneSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.message }
  try {
    if (parsed.data.id) {
      await prisma.phoneNumber.update({
        where: { id: parsed.data.id },
        data: {
          type: parsed.data.type,
          phoneNumber: parsed.data.phoneNumber,
          countryCode: parsed.data.countryCode ?? "+94",
        },
      })
    } else {
      await prisma.phoneNumber.create({
        data: {
          userId,
          type: parsed.data.type,
          phoneNumber: parsed.data.phoneNumber,
          countryCode: parsed.data.countryCode ?? "+94",
        },
      })
    }
    revalidatePath(`/user-dashboard/${userId}`)
    return { success: true }
  } catch {
    return { success: false, error: "phone_save_failed" }
  }
}

export async function deletePhone(userId: string, phoneId: string): Promise<ApiResponse> {
  await requireAuth();
  await requireRole(["admin", "super-admin", "customer"]);
  try {
    await prisma.phoneNumber.update({
      where: { id: phoneId },
      data: { isActive: false },
    })
    revalidatePath(`/user-dashboard/${userId}`)
    return { success: true }
  } catch(error) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "server error",
    };
  }
}

export async function upsertAddress(userId: string, input: unknown): Promise<ApiResponse> {
  await requireAuth();
  await requireRole(["admin", "super-admin", "customer"]);
  const parsed = addressSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.message }
  try {
    if (parsed.data.id) {
      await prisma.address.update({
        where: { id: parsed.data.id },
        data: {
          type: parsed.data.type,
          houseNo: parsed.data.houseNo,
          addressLine1: parsed.data.addressLine1,
          addressLine2: parsed.data.addressLine2 ?? null,
          city: parsed.data.city,
          province: parsed.data.province,
          zipcode: parsed.data.zipcode as string ?? null,
        },
      })
    } else {
      await prisma.address.create({
        data: {
          userId,
          type: parsed.data.type,
          houseNo: parsed.data.houseNo,
          addressLine1: parsed.data.addressLine1,
          addressLine2: parsed.data.addressLine2 ?? null,
          city: parsed.data.city,
          province: parsed.data.province,
          zipcode: parsed.data.zipcode as string ?? null,
        },
      })
    }
    revalidatePath(`/user-dashboard/${userId}`)
    return { success: true }
  } catch(error) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "server error",
    };
  }
}

export async function deleteAddress(userId: string, addressId: string): Promise<ApiResponse> {
  await requireAuth();
  await requireRole(["admin", "super-admin", "customer"]);
  try {
    await prisma.address.delete({
      where: { id: addressId },
    })
    revalidatePath(`/user-dashboard/${userId}`)
    return { success: true }
  } catch(error) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "server error",
    };
  }
}

export async function getOrderHistory(userId: string): Promise<ApiResponse> {
  try {
    await requireAuth();
    await requireRole(["customer", "admin", "super-admin"]);

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: true,
        payments: { select: { status: true } },
      },
    })

    const serializedOrders = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      discountAmount: order.discountAmount ? Number(order.discountAmount) : 0,
      shippingFee: Number(order.shippingFee),
      taxAmount: Number(order.taxAmount),
      totalAmount: Number(order.totalAmount),
      
      // Convert Decimal fields inside the nested orderItems array
      orderItems: order.orderItems.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        discountAmount: item.discountAmount ? Number(item.discountAmount) : 0,
        totalPrice: Number(item.totalPrice),
        //price: item.price ? Number(item.price) : 0, 
      })),
    }));

    return { 
      success: true, 
      data: serializedOrders 
    }
    
  } catch(error) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "server error",
    };
  }
}

export async function getPaymentHistory(userId: string): Promise<ApiResponse> {
  try {
    await requireAuth();
    await requireRole(["admin", "super-admin", "customer"]);

    const payments = await prisma.payment.findMany({
      where: { order: { userId } },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { id: true, status: true, orderNumber: true } },
      },
    })

    const serializedPayments = payments.map((payment) => ({
      ...payment,
      amount: payment.amount ? Number(payment.amount) : 0, // or payment.amount.toNumber()
    }));

    return { 
      success: true, 
      data: serializedPayments 
    }
  } catch(error) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error instanceof Error ? error.message : "server error",
    };
  }
}