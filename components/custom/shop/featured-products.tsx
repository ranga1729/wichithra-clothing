'use client'

import { ProductSearchResult } from '@/schemas/shop-schemas'
import ProductCard from './product-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface KoaFeaturedProductsProps {
  products: ProductSearchResult[]
}

export function KoaFeaturedProducts({ products }: KoaFeaturedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3 font-medium">
            Curated for you
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Featured Collection
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Premium activewear and casual wear designed for warriors
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-14">
          <Button asChild variant="outline" size="lg" className="px-8">
            <Link href="/search">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
