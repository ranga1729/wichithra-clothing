"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { searchProducts } from "./actions"
import { Search as SearchIcon, SlidersHorizontal, PackageOpen } from "lucide-react"
import { useState, useCallback, useEffect, FormEvent, Suspense, useMemo } from "react"
import ProductCard from "@/components/custom/shop/product-card"
import ProductPaginator from "@/components/custom/shop/product-paginator"
import { ProductCardGridSkeleton } from "@/components/custom/shop/product-card-skeleton"
import { SearchFilterSheet } from "@/components/custom/shop/search-filter-sheet"
import { useShopFiltersStore } from "@/lib/zustand-stores/shop-filters-store"
import { SearchFilters } from "@/schemas/shop-schemas"
import { ClothingSize } from "@/generated/prisma/enums"
import { useSearchFilterOptions } from "@/hooks/use-search-filter-options"

const PAGE_SIZE = 20

function parseFiltersFromUrl(searchParams: URLSearchParams): SearchFilters {
  const category = searchParams.get("category")?.split(",").filter(Boolean)
  const design = searchParams.get("design")?.split(",").filter(Boolean)
  const color = searchParams.get("color")?.split(",").filter(Boolean)
  const size = searchParams.get("size")?.split(",").filter(Boolean) as ClothingSize[] | undefined
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const sortColumn = searchParams.get("sortColumn") as SearchFilters["sortColumn"] | undefined
  const sortOrder = searchParams.get("sortOrder") as SearchFilters["sortOrder"] | undefined

  return {
    category: category && category.length > 0 ? category : undefined,
    design: design && design.length > 0 ? design : undefined,
    color: color && color.length > 0 ? color : undefined,
    size: size && size.length > 0 ? size : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortColumn: sortColumn ?? undefined,
    sortOrder: sortOrder ?? undefined,
  }
}

function hasActiveFilters(filters: SearchFilters): boolean {
  return !!(
    (filters.category && filters.category.length > 0) ||
    (filters.design && filters.design.length > 0) ||
    (filters.color && filters.color.length > 0) ||
    (filters.size && filters.size.length > 0) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const pageParam = searchParams.get("page")
  const [query, setQuery] = useState(q)
  const [sheetOpen, setSheetOpen] = useState(false)

  const initializeFromUrl = useShopFiltersStore((s) => s.initializeFromUrl)
  const setOpen = useShopFiltersStore((s) => s.setOpen)
  const storeSortColumn = useShopFiltersStore((s) => s.sortColumn)
  const storeSortOrder = useShopFiltersStore((s) => s.sortOrder)

  const { data: filterOptions } = useSearchFilterOptions()

  const filters = useMemo<SearchFilters>(
    () => parseFiltersFromUrl(searchParams),
    [searchParams],
  )

  const currentPage = useMemo(() => {
    const p = pageParam ? Number(pageParam) : 0
    return isNaN(p) || p < 0 ? 0 : p
  }, [pageParam])

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const state = useShopFiltersStore.getState()
      const params = new URLSearchParams()

      if (query.trim()) {
        params.set("q", query.trim())
      }

      if (state.selectedCategories.length > 0) {
        params.set("category", state.selectedCategories.join(","))
      }
      if (state.selectedDesigns.length > 0) {
        params.set("design", state.selectedDesigns.join(","))
      }
      if (state.selectedColors.length > 0) {
        params.set("color", state.selectedColors.join(","))
      }
      if (state.selectedSizes.length > 0) {
        params.set("size", state.selectedSizes.join(","))
      }
      if (state.priceRange[0] > 0) {
        params.set("minPrice", String(state.priceRange[0]))
      }
      if (state.priceRange[1] > 0) {
        params.set("maxPrice", String(state.priceRange[1]))
      }

      const sortCol = overrides.sortColumn ?? state.sortColumn
      const sortOrd = overrides.sortOrder ?? state.sortOrder
      if (sortCol !== "name" || sortOrd !== "asc") {
        params.set("sortColumn", sortCol)
        params.set("sortOrder", sortOrd)
      }

      if (overrides.page !== undefined) {
        if (overrides.page !== "0") params.set("page", overrides.page)
      } else if (currentPage > 0) {
        params.set("page", String(currentPage))
      }

      return `/search?${params.toString()}`
    },
    [query, currentPage],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search", q, filters, currentPage, storeSortColumn, storeSortOrder],
    queryFn: () =>
      searchProducts(
        q,
        hasActiveFilters(filters) ? filters : undefined,
        currentPage,
        PAGE_SIZE,
        storeSortColumn,
        storeSortOrder,
      ),
  })

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.category) count += filters.category.length
    if (filters.design) count += filters.design.length
    if (filters.color) count += filters.color.length
    if (filters.size) count += filters.size.length
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count += 1
    return count
  }, [filters])

  useEffect(() => {
    initializeFromUrl({
      category: filters.category,
      design: filters.design,
      color: filters.color,
      size: filters.size,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sortColumn: filters.sortColumn,
      sortOrder: filters.sortOrder,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const url = buildUrl({ page: "0" })
      router.push(url)
    },
    [router, buildUrl],
  )

  const handleApplyFilters = useCallback(() => {
    const url = buildUrl({ page: "0" })
    router.push(url)
  }, [router, buildUrl])

  const handlePageChange = useCallback(
    (page: number) => {
      const url = buildUrl({ page: String(page) })
      router.push(url)
    },
    [router, buildUrl],
  )

  const handleOpenSheet = useCallback(
    (open: boolean) => {
      setSheetOpen(open)
      setOpen(open)
    },
    [setOpen],
  )

  const products = data?.data?.products ?? []
  const totalRecords = data?.data?.totalRecords ?? 0

  const topCategories = filterOptions?.categories?.slice(0, 6) ?? []

  return (
    <div className="flex flex-col items-center">
      {/* Search Header */}
      <section className="w-full bg-muted/50 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-medium">
            Browse our collection
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            What&apos;s on your mind?
          </h1>

          <form
            onSubmit={handleSearch}
            className="flex w-full max-w-2xl mx-auto flex-row items-center gap-2"
          >
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                className="h-12 pl-10 bg-background border-border"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6">
              Search
            </Button>
          </form>

          {/* Category quick links */}
          {topCategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {topCategories.map((cat: { name: string; value: string }) => (
                <Button
                  key={cat.value}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    router.push(`/search?category=${encodeURIComponent(cat.name)}`)
                  }}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <div className="w-full max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleOpenSheet(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs h-5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {totalRecords > 0 && (
            <p className="text-sm text-muted-foreground">
              {totalRecords} result{totalRecords !== 1 ? "s" : ""}
              {q ? ` for "${q}"` : ""}
            </p>
          )}
        </div>

        <SearchFilterSheet
          open={sheetOpen}
          onOpenChange={handleOpenSheet}
          onApply={handleApplyFilters}
        />

        {isLoading && (
          <div className="mt-8">
            <ProductCardGridSkeleton count={8} />
          </div>
        )}

        {isError && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-lg text-destructive">
              {error?.message || "Something went wrong"}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-4">
            <div className="p-6 bg-muted rounded-full">
              <PackageOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">
              {q ? `No products found for "${q}"` : "No products available"}
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  primaryImage={product.primaryImage}
                  categoryName={product.categoryName}
                  slug={product.slug}
                  status={product.status}
                  colors={product.colors}
                  sizes={product.sizes}
                  price={product.price}
                  discountPercentage={product.discountPercentage}
                />
              ))}
            </div>

            <div className="mt-10">
              <ProductPaginator
                pageIndex={currentPage}
                totalRecords={totalRecords}
                pageSize={PAGE_SIZE}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
