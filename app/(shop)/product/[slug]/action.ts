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
            sellingPrice: true,
            isActive: true,
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
                swatchImageUrl: true,
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

    const serialized = JSON.parse(JSON.stringify(product)) as ProductDetail;

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
