'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { searchProducts } from "./actions"
import { Search as SearchIcon, Loader2, PackageOpen } from "lucide-react"
import { useState, useCallback, FormEvent, Suspense } from "react"
import ProductCard from "@/components/custom/shop/product-card"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = searchParams.get("q") || ""
  const [query, setQuery] = useState(q)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchProducts(query),
    enabled: q.length > 0,
  })

  const handleSearch = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      const trimmed = query.trim()
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    },
    [query, router],
  )

  console.log(data);
  console.log({isLoading})

  return (
    <Suspense>
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
    </Suspense>
  )
}