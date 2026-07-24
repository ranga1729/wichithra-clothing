'use server'

import { en } from "@/lib/i18n/en"
import { notDeleted, prisma } from "@/lib/prisma"
import { ProductSearchResult, SearchResultColors } from "@/schemas/shop-schemas"
import { ApiResponse } from "@/types/auth-types"

export async function getFeaturedProducts(): Promise<ApiResponse<ProductSearchResult[]>> {
  try {
    const products = await prisma.product.findMany({
      where: {
        ...notDeleted,
        isFeatured: true,
        status: { in: ["AVAILABLE", "OUTOFSTOCK"] },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        sellingPrice: true,
        discountPercentage: true,
        category: {
          select: { name: true },
        },
        variants: {
          where: { ...notDeleted, isActive: true },
          select: {
            size: true,
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
                swatchImageUrl: true,
              },
            },
          },
        },
        productImages: {
          select: {
            imageUrl: true,
            isPrimary: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    })

    const results: ProductSearchResult[] = products.map((p) => {
      const baseSizes = Array.from(new Set(p.variants.map((v) => v.size)))

      const colorMap = new Map<string, SearchResultColors>()
      for (const variant of p.variants) {
        if (variant.color && !colorMap.has(variant.color.id)) {
          colorMap.set(variant.color.id, {
            name: variant.color.name,
            hexCode: variant.color.hexCode ?? undefined,
            swatchImageUrl: variant.color.swatchImageUrl ?? undefined,
          })
        }
      }
      const aggregatedColors = Array.from(colorMap.values())

      const basePrice = Number(p.sellingPrice)
      const primaryImage =
        p.productImages.find((image) => image.isPrimary === true) ?? p.productImages[0]

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryName: p.category.name,
        colors: aggregatedColors,
        sizes: baseSizes,
        price: basePrice,
        status: p.status,
        primaryImage: primaryImage?.imageUrl ?? "",
        discountPercentage: Number(p.discountPercentage) || 0,
      }
    })

    return { success: true, data: results }
  } catch (error: unknown) {
    console.error(error)
    const message = error instanceof Error ? error.message : en.something_went_wrong
    return { success: false, error: message }
  }
}
