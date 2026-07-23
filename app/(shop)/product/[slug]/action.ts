'use server'

import { en } from "@/lib/i18n/en";
import { notDeleted, prisma } from "@/lib/prisma";
import { ProductDetail } from "@/schemas/shop-schemas";
import { ApiResponse } from "@/types/auth-types";

export async function getProductBySlug(slug: string): Promise<ApiResponse<ProductDetail>> {
  try {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        ...notDeleted,
        status: { in: 
          ["AVAILABLE", "OUTOFSTOCK", "DRAFT", "DISCONTINUED"] 
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        brand: true,
        material: true,
        careInstructions: true,
        sellingPrice: true,
        discountPercentage: true,
        gender: true,
        ageGroup: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        productImages: {
          where: { ...notDeleted },
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            isPrimary: true,
            sortOrder: true,
            colorId: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { ...notDeleted, isActive: true },
          select: {
            id: true,
            size: true,
            isActive: true,
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
                swatchImageUrl: true,
              },
            },
            inventory: {
              select: {
                quantity: true,
                reservedQuantity: true,
              },
            },
          },
          orderBy: [
            { size: 'asc' },
            { color: { name: 'asc' } },
          ],
        },
      },
    });

    if (!product) {
      return {
        success: false,
        error: en.product_doesnt_exist,
      };
    }

    const variantsWithStock = product.variants.map((v) => ({
      ...v,
      stock: (v.inventory?.quantity ?? 0) - (v.inventory?.reservedQuantity ?? 0),
    }))

    const serialized = JSON.parse(
      JSON.stringify({ ...product, variants: variantsWithStock })
    ) as ProductDetail;

    return {
      success: true,
      data: serialized,
    };
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : en.something_went_wrong;
    return { success: false, error: message };
  }
}
