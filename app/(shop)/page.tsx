'use client'

import { useQuery } from "@tanstack/react-query"
import { KoaFeaturedProducts } from "@/components/custom/shop/featured-products"
import { KoaFeatures } from "@/components/custom/shop/features"
import { KoaHero } from "@/components/custom/shop/hero"
import { getFeaturedProducts } from "./actions"

export default function ShopFront() {
  const { data } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => getFeaturedProducts(),
  })

  const featuredProducts = data?.success && data.data ? data.data : []

  return (
    <div className="flex flex-col items-center">
      <KoaHero />
      <KoaFeaturedProducts products={featuredProducts} />
      <KoaFeatures />
    </div>
  )
}
