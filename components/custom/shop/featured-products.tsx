'use client'

import Image from 'next/image'
import { Heart, ShoppingCart } from 'lucide-react'
import { useState } from 'react'

interface Product {
  id: number
  name: string
  price: number
  rating: number
  reviews: number
  image: string
  category: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Performance T-Shirt',
    price: 49.99,
    rating: 4.8,
    reviews: 128,
    image: '/products/performance-tee-black.png',
    category: 'Tops',
  },
  {
    id: 2,
    name: 'Running Shorts',
    price: 59.99,
    rating: 4.7,
    reviews: 95,
    image: '/products/running-shorts.png',
    category: 'Shorts',
  },
  {
    id: 3,
    name: 'Training Hoodie',
    price: 89.99,
    rating: 4.9,
    reviews: 156,
    image: '/products/training-hoodie.png',
    category: 'Hoodies',
  },
  {
    id: 4,
    name: 'Casual Joggers',
    price: 79.99,
    rating: 4.6,
    reviews: 112,
    image: '/products/joggers-gray.png',
    category: 'Pants',
  },
  {
    id: 5,
    name: 'Gym Pants',
    price: 69.99,
    rating: 4.8,
    reviews: 134,
    image: '/products/gym-pants-black.png',
    category: 'Pants',
  },
  {
    id: 6,
    name: 'Athletic Tank',
    price: 39.99,
    rating: 4.7,
    reviews: 89,
    image: '/products/tank-top-navy.png',
    category: 'Tops',
  },
  {
    id: 7,
    name: 'Windbreaker Jacket',
    price: 119.99,
    rating: 4.9,
    reviews: 167,
    image: '/products/windbreaker-blue.png',
    category: 'Jackets',
  },
  {
    id: 8,
    name: 'Compression Shirt',
    price: 54.99,
    rating: 4.8,
    reviews: 142,
    image: '/products/compression-shirt.png',
    category: 'Tops',
  },
]

export function KoaFeaturedProducts() {
  const [favorites, setFavorites] = useState<number[]>([])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

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
            <div
              key={product.id}
              className="group bg-white border border-[#CCCCCC] rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-[#F3F4F6] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-[#F3F4F6] transition"
                  aria-label="Add to favorites"
                >
                  <Heart
                    className={`w-5 h-5 transition ${
                      favorites.includes(product.id)
                        ? 'fill-[#3D79BE] text-[#3D79BE]'
                        : 'text-[#2A2A2A]'
                    }`}
                  />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-sm text-[#5197D6] font-semibold mb-1">
                  {product.category}
                </p>
                <h3 className="text-lg font-semibold text-koa-black mb-2">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(product.rating)
                            ? 'text-[#3D79BE]'
                            : 'text-[#CCCCCC]'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-[#2A2A2A]">
                    ({product.reviews})
                  </span>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-koa-black">
                    ${product.price.toFixed(2)}
                  </span>
                  <button className="p-2 bg-[#3D79BE] text-white rounded-lg hover:bg-[#2D5FA3] transition">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 border-2 border-[#3D79BE] text-[#3D79BE] font-semibold rounded-lg hover:bg-[#3D79BE] hover:text-white transition">
            View All Products
          </button>
        </div>
      </div>
    </section>
  )
}
