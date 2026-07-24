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

function NewsletterSection() {
  return (
    <section className="py-20 px-4 bg-foreground text-background">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-background/60 mb-3 font-medium">
          Stay in the loop
        </p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join the KOA Community
        </h2>
        <p className="text-background/70 mb-8">
          Get early access to new drops, exclusive deals, and warrior-approved style guides.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Enter your email" 
            className="bg-background/10 border-background/20 text-background placeholder:text-background/40 h-12"
          />
          <Button size="lg" className="h-12 px-8 shrink-0">
            Subscribe
          </Button>
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
