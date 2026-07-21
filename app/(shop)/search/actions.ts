// app/search/actions.ts
'use server'

import { Prisma } from "@/generated/prisma/client"
import { en } from "@/lib/i18n/en"
import { notDeleted, prisma } from "@/lib/prisma"
import { ProductSearchResult, SearchResultColors, SearchFilters, SearchFilterOptions } from "@/schemas/shop-schemas"
import { ApiResponse } from "@/types/auth-types"

function buildSearchWhere(query: string, filters?: SearchFilters): Prisma.ProductWhereInput {
  const conditions: Prisma.ProductWhereInput[] = [
    {
      ...notDeleted,
      status: {
        in: ["DRAFT", "AVAILABLE", "OUTOFSTOCK", "DISCONTINUED"],
      },
    },
  ]

  if (query) {
    conditions.push({
      name: { contains: query, mode: "insensitive" },
    })
  }

  if (filters) {
    if (filters.category && filters.category.length > 0) {
      conditions.push({
        category: { name: { in: filters.category } },
      })
    }

    if (filters.design && filters.design.length > 0) {
      conditions.push({
        productDesigns: { some: { design: { slug: { in: filters.design } } } },
      })
    }

    if (filters.color && filters.color.length > 0) {
      conditions.push({
        variants: {
          some: {
            ...notDeleted,
            isActive: true,
            color: { name: { in: filters.color } },
          },
        },
      })
    }

    if (filters.size && filters.size.length > 0) {
      conditions.push({
        variants: {
          some: {
            ...notDeleted,
            isActive: true,
            size: { in: filters.size },
          },
        },
      })
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const sellingPriceCondition: Record<string, number> = {}
      if (filters.minPrice !== undefined) sellingPriceCondition.gte = filters.minPrice
      if (filters.maxPrice !== undefined) sellingPriceCondition.lte = filters.maxPrice

      if (Object.keys(sellingPriceCondition).length > 0) {
        conditions.push({
          sellingPrice: sellingPriceCondition,
        })
      }
    }
  }

  return { AND: conditions }
}

export async function searchProducts(q: string, filters?: SearchFilters,): Promise<ApiResponse<ProductSearchResult[]>> {
  try {
    const query = q?.trim() ?? ""

    if (!query && !filters) {
      return { success: true, data: [] }
    }

    const where = buildSearchWhere(query, filters)

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        sellingPrice: true,
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
      orderBy: { name: "asc" },
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
      }
    })

    return { success: true, data: results }
  } catch (error: unknown) {
    console.error(error)
    const message = error instanceof Error ? error.message : en.something_went_wrong
    return { success: false, error: message }
  }
}

export async function getSearchFilterOptions(): Promise<ApiResponse<SearchFilterOptions>> {
  try {
    const activeProductWhere: Prisma.ProductWhereInput = {
      ...notDeleted,
      status: { in: ["AVAILABLE", "OUTOFSTOCK"] },
    }

    const [categoryRows, designRows, colorRows, sizeRows, priceRow] = await Promise.all([
      prisma.category.findMany({
        where: { ...notDeleted, isActive: true, products: { some: activeProductWhere } },
        select: { name: true },
        orderBy: { name: "asc" },
      }),

      prisma.design.findMany({
        where: {
          ...notDeleted,
          isActive: true,
          productDesigns: { some: { product: activeProductWhere } },
        },
        select: { name: true, slug: true },
        orderBy: { name: "asc" },
      }),

      prisma.color.findMany({
        where: {
          ...notDeleted,
          isActive: true,
          variants: {
            some: {
              ...notDeleted,
              isActive: true,
              product: activeProductWhere,
            },
          },
        },
        select: { name: true, hexCode: true, swatchImageUrl: true },
        orderBy: { name: "asc" },
      }),

      prisma.productVariant.findMany({
        where: { ...notDeleted, isActive: true, product: activeProductWhere },
        select: { size: true },
        distinct: ["size"],
        orderBy: { size: "asc" },
      }),

      prisma.product.aggregate({
        where: { ...notDeleted, status: { in: ["AVAILABLE", "OUTOFSTOCK"] } },
        _min: { sellingPrice: true },
        _max: { sellingPrice: true },
      }),
    ])

    const options: SearchFilterOptions = {
      categories: categoryRows.map((c) => ({ name: c.name, value: c.name })),
      designs: designRows.map((d) => ({ name: d.name, value: d.slug })),
      colors: colorRows.map((c) => ({
        name: c.name,
        hexCode: c.hexCode,
        swatchImageUrl: c.swatchImageUrl,
      })),
      sizes: sizeRows.map((s) => s.size),
      priceRange: {
        min: Number(priceRow._min.sellingPrice ?? 0),
        max: Number(priceRow._max.sellingPrice ?? 0),
      },
    }

    return { success: true, data: options }
  } catch (error: unknown) {
    console.error(error)
    const message = error instanceof Error ? error.message : en.something_went_wrong
    return { success: false, error: message }
  }
}
