// app/search/actions.ts
'use server'

import ProductCard from "@/components/custom/shop/product-card";
import { en } from "@/lib/i18n/en";
import { notDeleted, prisma } from "@/lib/prisma";
import { ProductSearchResult, SearchResultColors } from "@/schemas/shop-schemas";
import { ApiResponse } from "@/types/auth-types";

export async function searchProducts(q: string): Promise<ApiResponse<ProductSearchResult[]>> {
  try {
    const query = q.trim()

    if (!query) {
      return {
        success: true, 
        data: []
      }
    }

    const products = await prisma.product.findMany({
      where: {
        ...notDeleted,
        status: {
          // Remove draft later
          in: ["DRAFT", "AVAILABLE", "OUTOFSTOCK", "DISCONTINUED"]
        },
        name: { contains: query, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        category: {
          select: { 
            name: true 
          },
        },
        variants: {
          where: { ...notDeleted, isActive: true },
          select: {
            sellingPrice: true,
            size: true,
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
                swatchImageUrl: true,
              }
            },
          }
        },
        productImages: {
          select: {
            imageUrl: true,
            isPrimary: true,
          }
        }, 
      },
      orderBy: { name: 'asc' },
    });

    const results: ProductSearchResult[] = products.map((p) => {
      const baseSizes = Array.from(new Set(p.variants.map((v) => v.size)));
      
      const colorMap = new Map<string, SearchResultColors>();
      
      for (const variant of p.variants) {
        if (variant.color && !colorMap.has(variant.color.id)) {
          colorMap.set(variant.color.id, {
            name: variant.color.name,
            hexCode: variant.color.hexCode ?? undefined,
            swatchImageUrl: variant.color.swatchImageUrl ?? undefined,
          });
        }
      }
      const aggregatedColors = Array.from(colorMap.values());

      const numericPrices = p.variants.map((v) => Number(v.sellingPrice));
      const basePrice = numericPrices.length > 0 ? Math.min(...numericPrices) : 0;
      const primaryImage = p.productImages.find((image) => image.isPrimary === true) ?? p.productImages[0];

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryName: p.category.name,
        colors: aggregatedColors,
        sizes: baseSizes,
        price: basePrice,
        status : p.status,
        primaryImage: primaryImage?.imageUrl ?? "",
      };
    });

    console.log(results);

    return { 
      success: true, 
      data: results 
    };
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : en.something_went_wrong;
    return { success: false, error: message };
  }
}