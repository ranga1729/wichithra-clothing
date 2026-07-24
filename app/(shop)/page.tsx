'use client'

import { useQuery } from "@tanstack/react-query"
import { KoaFeaturedProducts } from "@/components/custom/shop/featured-products"
import { KoaFeatures } from "@/components/custom/shop/features"
import { KoaHero } from "@/components/custom/shop/hero"
import { getFeaturedProducts } from "./actions"
import { Truck, RotateCcw, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import NewsletterSection from "@/components/custom/shop/news-letter-section"

function PromoBar() {
  const perks = [
    { icon: Truck, text: "Free Islandwide Shipping" },
    { icon: RotateCcw, text: "7-Day Easy Returns" },
    { icon: ShieldCheck, text: "Secure Payment" },
  ]

  return (
    <section className="border-y border-border bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <perk.icon className="h-4 w-4 text-primary" />
              <span>{perk.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ShopFront() {
  const { data } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => getFeaturedProducts(),
  })

  const featuredProducts = data?.success && data.data ? data.data : []

  return (
    <div className="flex flex-col items-center">
      <KoaHero />
      <PromoBar />
      <KoaFeaturedProducts products={featuredProducts} />
      <KoaFeatures />
      <NewsletterSection />
    </div>
  )
}
