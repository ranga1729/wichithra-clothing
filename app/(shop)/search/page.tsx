"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { searchProducts } from "./actions"
import { Search as SearchIcon, SlidersHorizontal, Loader2, PackageOpen } from "lucide-react"
import { useState, useCallback, useEffect, FormEvent, Suspense, useMemo } from "react"
import ProductCard from "@/components/custom/shop/product-card"
import { SearchFilterSheet } from "@/components/custom/shop/search-filter-sheet"
import { useShopFiltersStore } from "@/lib/zustand-stores/shop-filters-store"
import { SearchFilters } from "@/schemas/shop-schemas"
import { ClothingSize } from "@/generated/prisma/enums"

function parseFiltersFromUrl(searchParams: URLSearchParams): SearchFilters {
  const category = searchParams.get("category")?.split(",").filter(Boolean)
  const design = searchParams.get("design")?.split(",").filter(Boolean)
  const color = searchParams.get("color")?.split(",").filter(Boolean)
  const size = searchParams.get("size")?.split(",").filter(Boolean) as ClothingSize[] | undefined
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")

  return {
    category: category && category.length > 0 ? category : undefined,
    design: design && design.length > 0 ? design : undefined,
    color: color && color.length > 0 ? color : undefined,
    size: size && size.length > 0 ? size : undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
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
  const [query, setQuery] = useState(q)
  const [sheetOpen, setSheetOpen] = useState(false)

  const initializeFromUrl = useShopFiltersStore((s) => s.initializeFromUrl)
  const setOpen = useShopFiltersStore((s) => s.setOpen)

  const filters = useMemo<SearchFilters>(
    () => parseFiltersFromUrl(searchParams),
    [searchParams],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search", q, filters],
    queryFn: () => searchProducts(q, hasActiveFilters(filters) ? filters : undefined),
    enabled: q.length > 0,
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
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      if (!trimmed) return
      const params = new URLSearchParams()
      params.set("q", trimmed)
      router.push(`/search?${params.toString()}`)
    },
    [query, router],
  )

  const handleApplyFilters = useCallback(() => {
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

    router.push(`/search?${params.toString()}`)
  }, [query, router])

  const handleOpenSheet = useCallback(
    (open: boolean) => {
      setSheetOpen(open)
      setOpen(open)
    },
    [setOpen],
  )

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

      {q && (
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
      )}

      <SearchFilterSheet
        open={sheetOpen}
        onOpenChange={handleOpenSheet}
        onApply={handleApplyFilters}
      />

      <div className="w-full max-w-7xl">
        {!q && (
          <p className="mt-12 text-center text-muted-foreground">
            Enter a search term to find products
          </p>
        )}

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

        {data?.data && data.data.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <PackageOpen className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              No products found for &quot;{q}&quot;
            </p>
          </div>
        )}

        {data?.data && data.data.length > 0 && (
          <div className="mt-8">
            <p className="mb-4 text-sm text-muted-foreground">
              {data.data.length} result{data.data.length !== 1 ? "s" : ""} for
              &quot;{q}&quot;
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {data.data.map((product) => (
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
          </div>
        )}
      </div>
    </div>
  )
}
