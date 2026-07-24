"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { searchProducts } from "./actions"
import { Search as SearchIcon, SlidersHorizontal, Loader2, PackageOpen } from "lucide-react"
import { useState, useCallback, useEffect, FormEvent, Suspense, useMemo } from "react"
import ProductCard from "@/components/custom/shop/product-card"
import ProductPaginator from "@/components/custom/shop/product-paginator"
import { SearchFilterSheet } from "@/components/custom/shop/search-filter-sheet"
import { useShopFiltersStore } from "@/lib/zustand-stores/shop-filters-store"
import { SearchFilters } from "@/schemas/shop-schemas"
import { ClothingSize } from "@/generated/prisma/enums"

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

  const filters = useMemo<SearchFilters>(
    () => parseFiltersFromUrl(searchParams),
    [searchParams],
  )

  const currentPage = useMemo(() => {
    const p = pageParam ? Number(pageParam) : 0
    return isNaN(p) || p < 0 ? 0 : p
  }, [pageParam])

  // Build URL from current state
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

  // Sync URL params to store on mount
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

  return (
    <div className="flex flex-col items-center mt-20 mb-10 gap-8 px-4">
      <p className="text-4xl font-bold">What&apos;s on your mind?</p>

      <form
        onSubmit={handleSearch}
        className="flex w-full max-w-2xl flex-row items-center justify-center gap-2"
      >
        <Input
          type="text"
          placeholder="anything in your mind"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          className="h-10 flex-1 border placeholder:text-neutral-500"
        />
        <Button type="submit" className="gap-2">
          <SearchIcon className="h-4 w-4" />
          Search
        </Button>
      </form>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => handleOpenSheet(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="bg-primary text-primary-foreground ml-1 flex size-5 items-center justify-center rounded-full text-xs">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <SearchFilterSheet
        open={sheetOpen}
        onOpenChange={handleOpenSheet}
        onApply={handleApplyFilters}
      />

      <div className="w-full max-w-7xl">
        {isLoading && (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {isError && (
          <p className="mt-12 text-center text-destructive">
            {error?.message || "Something went wrong"}
          </p>
        )}

        {!isLoading && !isError && products.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <PackageOpen className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              {q ? `No products found for "${q}"` : "No products available"}
            </p>
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-8">
            <p className="mb-4 text-sm text-muted-foreground">
              {totalRecords} result{totalRecords !== 1 ? "s" : ""}
              {q ? ` for "${q}"` : ""}
              {(currentPage > 0 || products.length < totalRecords) &&
                ` — Page ${currentPage + 1} of ${Math.ceil(totalRecords / PAGE_SIZE)}`}
            </p>
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
                />
              ))}
            </div>

            <div className="mt-8">
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
