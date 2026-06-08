'use server'

import { en } from "@/lib/i18n/en";
import { notDeleted, prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { InventoryFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { createInventoryItemSchema, CreateInventoryItemSchema } from "@/schemas/admin-schemas";
import { revalidatePath } from "next/cache";

export async function getInventory(paginator: Paginator, filter: InventoryFilter): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const whereClause: any = {
      ...notDeleted,
      ...(filter.sku && {
        variant: {
          sku: {
            contains: filter.sku as string,
            mode: 'insensitive',
          },
        },
      }),
      ...(filter.productName && {
        variant: {
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
        quantity: true,
        reservedQuantity: true,
        lowStockThreshold: true,
        variant: {
          select: {
            id: true,
            sku: true,
            costPrice: true,
            sellingPrice: true,
            isActive: true,
            product: {
              select: {
                id: true,
                name: true,
                discountPercentage: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
                swatchImageUrl: true,
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
      },
      skip,
      take: pageSize,
      orderBy: [
        { variant: { product: { name: 'asc' } } },
        { variant: { sku: 'asc' } },
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

export async function getProductSelectorData(categorySlug?: string, nameSearch?: string): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const products = await prisma.product.findMany({
      where: {
        ...notDeleted,
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(nameSearch && { name: { contains: nameSearch, mode: 'insensitive' } }),
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
      take: 50,
    });

    return { success: true, data: products };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return { success: false, error: error.message || en.failed_to_load_product_selector_data };
  }
}

export async function getColorSelectorData(): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const colors = await prisma.color.findMany({
      where: { ...notDeleted, isActive: true },
      select: { id: true, name: true, hexCode: true },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: colors };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return { success: false, error: error.message || en.data_retrieval_failed };
  }
}

export async function getSizeSelectorData(): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const sizes = await prisma.size.findMany({
      where: { ...notDeleted, isActive: true },
      select: { id: true, name: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    });

    return { success: true, data: sizes };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return { success: false, error: error.message || en.data_retrieval_failed };
  }
}

export async function checkVariantExists(productId: string, colorId: string, sizeId: string): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const variant = await prisma.productVariant.findUnique({
      where: {
        productId_colorId_sizeId: { productId, colorId, sizeId },
      },
      select: { 
        id: true, 
        sku: true 
      },
    });

    return { 
      success: true, 
      data: { 
        exists: !!variant, 
        variant: variant
      } 
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return { success: false, error: error.message || en.data_retrieval_failed };
  }
}

export async function createInventoryItem(data: CreateInventoryItemSchema): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const validatedData = createInventoryItemSchema.parse(data);

    // Check if variant already exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: {
        productId_colorId_sizeId: {
          productId: validatedData.productId,
          colorId: validatedData.colorId,
          sizeId: validatedData.sizeId,
        },
      },
    });

    if (existingVariant) {
      return { success: false, error: en.variant_already_exists };
    }

    // Check if SKU is unique
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: validatedData.sku },
    });

    if (existingSku) {
      return { success: false, error: en.sku_already_exists };
    }

    // Create variant + inventory in a transaction
    await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId: validatedData.productId,
          colorId: validatedData.colorId,
          sizeId: validatedData.sizeId,
          sku: validatedData.sku,
          costPrice: validatedData.costPrice,
          sellingPrice: validatedData.sellingPrice,
          isActive: validatedData.isActive,
        },
      });

      await tx.inventory.create({
        data: {
          variantId: variant.id,
          quantity: validatedData.quantity,
          lowStockThreshold: validatedData.lowStockThreshold ?? 5,
        },
      });
    });

    revalidatePath('/admin/inventory');

    return {
      success: true,
      message: en.inventory_item_created_successfully,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message || en.failed_to_create_inventory_item,
    };
  }
}
