'use client'

import { ProductSearchResult } from '@/schemas/shop-schemas'
import ProductCard from './product-card'
import Link from 'next/link'

interface KoaFeaturedProductsProps {
  products: ProductSearchResult[]
}

export function KoaFeaturedProducts({ products }: KoaFeaturedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="py-16 px-4 max-w-7xl">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-koa-black mb-4">
            Featured Collection
          </h2>
          <p className="text-lg text-[#2A2A2A] max-w-2xl mx-auto">
            Curated selection of premium activewear and casual wear for the modern man
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link className="px-8 py-3 border-2 border-[#3D79BE] text-[#3D79BE] font-semibold rounded-lg hover:bg-[#3D79BE] hover:text-white transition" href={'/search'}>
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}
