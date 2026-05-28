'use server'

import { en } from "@/lib/i18n/en";
import { notDeleted, prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { InventoryFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { AuthError, requireRole } from "@/lib/server-auth-guard";

export async function getInventory(paginator: Paginator, filter: InventoryFilter): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);
    
    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const whereClause: any = {
      ...notDeleted,
      ...(filter.sku && {
        sku: {
          contains: filter.sku as string,
          mode: 'insensitive',
        },
      }),
      ...(filter.productName && {
        productSize: {
          product: {
            name: {
              contains: filter.productName as string,
              mode: 'insensitive',
            },
          },
        },
      }),
    };

    const inventory = await prisma.inventory.findMany({
      where: whereClause,
      select: {
        id: true,
        sku: true,
        quantity: true,
        reservedQuantity: true,
        lowStockThreshold: true,
        costPrice: true,
        productSize: {
          select: {
            id: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
            size: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        productColor: {
          select: {
            id: true,
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
              },
            },
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: [
        { productSize: { product: { name: 'asc' } } },
        { sku: 'asc' },
      ],
    });

    const totalRecords = await prisma.inventory.count({
      where: whereClause,
    });

    const serializedInventory = JSON.parse(JSON.stringify(inventory));

    return {
      success: true,
      data: {
        inventory: serializedInventory,
        totalRecords,
      },
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message || en.inventory_data_retrieval_failed,
    };
  }
}
