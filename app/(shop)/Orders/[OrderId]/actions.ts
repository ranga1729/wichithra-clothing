"use server"

import { requireRole } from "@/lib/server-auth-guard"
import { prisma } from "@/lib/prisma"
import type { ApiResponse } from "@/types/auth-types"

// Helper function to recursively convert Prisma Decimals to plain numbers
function serializeDecimals(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj;
  
  // Duck-type check for Prisma Decimal (which has a toNumber method)
  if (typeof obj.toNumber === "function") return obj.toNumber();
  
  if (Array.isArray(obj)) return obj.map(serializeDecimals);
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, serializeDecimals(value)])
  );
}

export async function getOrderDetail(orderId: string): Promise<ApiResponse> {
  try {
    await requireRole(["customer", "admin", "super-admin"])
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        orderStatusHistory: {
          orderBy: { createdAt: "asc" },
        },
        payments: true,
      },
    })
    
    if (!order) return { success: false, error: "Order not found" }
    
    // Pass the Prisma result through the serializer before returning
    const serializedOrder = serializeDecimals(order);
    
    return { success: true, data: serializedOrder }
  } catch {
    return { success: false, error: "server_error" }
  }
}