'use client'

import { useMemo, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Loader2, ShoppingCart, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { ClothingSize } from '@/generated/prisma/enums'
import { getProductBySlug } from '@/app/(shop)/product/[slug]/action'
import { ProductDetailColor } from '@/schemas/shop-schemas'
import { useCartStore } from '@/lib/zustand-stores/cart-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import ProductGallery from '@/components/custom/shop/product-gallery'
import SizeSelector from '@/components/custom/shop/size-selector'
import ColorSelector from '@/components/custom/shop/color-selector'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const params = useParams()
  const slug = params?.slug as string | undefined
  const [selectedSize, setSelectedSize] = useState<ClothingSize | null>(null)
  const [selectedColor, setSelectedColor] = useState<ProductDetailColor | null>(null)
  const [careOpen, setCareOpen] = useState(false)

  // query
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug!),
    enabled: !!slug,
  })

  const product = data?.success ? data.data : null

  const allSizes = useMemo(() => {
    if (!product) {
      return []
    } 
    return Array.from(new Set(product.variants.map((v) => v.size)))
  }, [product])

  const allColors = useMemo(() => {
    if (!product) {
      return []
    }
    const map = new Map<string, ProductDetailColor>()
    for (const variant of product.variants) {
      if (!map.has(variant.color.id)) {
        map.set(variant.color.id, variant.color)
      }
    }
    return Array.from(map.values())
  }, [product])

  const availableSizes = useMemo(() => {
    if (!product) {
      return []
    } 
    if (selectedColor) {
      return Array.from(
        new Set(
          product.variants
            .filter((v) => v.color.id === selectedColor.id)
            .map((v) => v.size),
        ),
      )
    }
    return allSizes
  }, [product, selectedColor, allSizes])

  const availableColors = useMemo(() => {
    if (!product) {
      return []
    }

    if (selectedSize) {
      const map = new Map<string, ProductDetailColor>()
      for (const variant of product.variants) {
        if (variant.size === selectedSize && !map.has(variant.color.id)) {
          map.set(variant.color.id, variant.color)
        }
      }
      return Array.from(map.values()).map((c) => c.id)
    }
    return allColors.map((c) => c.id)
  }, [product, selectedSize, allColors])

  const selectedVariant = useMemo(() => {
    if (!product || !selectedSize || !selectedColor) {
      return null
    }
    return (
      product.variants.find(
        (v) => v.size === selectedSize && v.color.id === selectedColor.id,
      ) ?? null
    )
  }, [product, selectedSize, selectedColor])

  const priceInfo = useMemo(() => {
    if (!product) return { min: 0, max: 0, hasDiscount: false, discountPct: 0 }
    const prices = product.variants.map((v) => Number(v.sellingPrice))
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const discountPct = Number(product.discountPercentage)
    return { min, max, hasDiscount: discountPct > 0, discountPct }
  }, [product])

  const currentPrice = useMemo(() => {
    if (selectedVariant) {
      const base = Number(selectedVariant.sellingPrice)
      if (priceInfo.hasDiscount) {
        return {
          original: base,
          discounted: base * (1 - priceInfo.discountPct / 100),
        }
      }
      return { original: base, discounted: null }
    }
    if (priceInfo.hasDiscount) {
      return {
        original: priceInfo.min,
        discounted: priceInfo.min * (1 - priceInfo.discountPct / 100),
      }
    }
    return { original: priceInfo.min, discounted: null }
  }, [selectedVariant, priceInfo])

  const handleSizeSelect = useCallback((size: ClothingSize) => {
    setSelectedSize((prev) => 
      (prev === size ? null : size)
    )
  }, [])

  const handleColorSelect = useCallback((color: ProductDetailColor) => {
    setSelectedColor((prev) => (
      prev?.id === color.id ? null : color)
    )
  }, [])

  const addItem = useCartStore((s) => s.addItem)

  const handleAddToCart = useCallback(() => {
    if (!selectedVariant || !product) return

    const primaryImage = product.productImages.find((img) => img.isPrimary)
      ?? product.productImages[0]

    addItem({
      id: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      categoryName: product.category.name,
      variantId: selectedVariant.id,
      size: selectedSize!,
      color: selectedVariant.color,
      imageUrl: primaryImage?.imageUrl ?? '',
      price: Number(selectedVariant.sellingPrice),
    })
  }, [product, selectedVariant, selectedSize, addItem])

  const handleBuyNow = useCallback(() => {
    toast.error('Coming soon!')
  }, [])

  const outOfStock = product && product.variants.length === 0

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-neutral-500">Product not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="w-full lg:w-[55%]">
          <ProductGallery
            images={product.productImages}
            selectedColorId={selectedColor?.id ?? null}
            altText={product.name}
          />
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-[45%]">
          <p className="text-sm text-neutral-500">
            {product.category.name}
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 lg:text-3xl">
            {product.name}
          </h1>

          {product.description && (
            <p className="leading-relaxed text-neutral-600">
              {product.description}
            </p>
          )}

          <div className="flex items-baseline gap-3">
            {currentPrice.discounted !== null ? (
              <>
                <span className="text-2xl font-bold text-neutral-900">
                  Rs {currentPrice.discounted.toFixed(2)}
                </span>
                <span className="text-lg text-neutral-400 line-through">
                  Rs {currentPrice.original.toFixed(2)}
                </span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  -{priceInfo.discountPct}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-neutral-900">
                {currentPrice.original > 0
                  ? `Rs ${currentPrice.original.toFixed(2)}`
                  : 'Price unavailable'}
              </span>
            )}
          </div>

          <Separator />

          {outOfStock ? (
            <div className="rounded-md bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-600">
              Out of Stock
            </div>
          ) : (
            <>
              <SizeSelector
                allSizes={allSizes}
                availableSizes={availableSizes}
                selectedSize={selectedSize}
                onSelect={handleSizeSelect}
              />

              <ColorSelector
                allColors={allColors}
                availableColors={availableColors}
                selectedColor={selectedColor}
                onSelect={handleColorSelect}
              />

              {selectedSize && selectedColor && !selectedVariant && (
                <p className="text-sm text-red-600">
                  This combination is not available. Please try a different size or color.
                </p>
              )}
            </>
          )}

          <Separator />

          {(product.material || product.careInstructions) && (
            <div className="flex flex-col gap-3 text-sm">
              {product.material && (
                <p className="text-neutral-600">
                  <span className="font-medium text-neutral-700">Material: </span>
                  {product.material}
                </p>
              )}
              {product.careInstructions && (
                <Collapsible open={careOpen} onOpenChange={setCareOpen}>
                  <CollapsibleTrigger className="flex items-center gap-1 text-left font-medium text-neutral-700 hover:text-neutral-900">
                    Care Instructions
                    {careOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 text-neutral-600 whitespace-pre-line">
                    {product.careInstructions}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}

          {!outOfStock && (
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={!selectedVariant}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleBuyNow}
                disabled={!selectedVariant}
              >
                Buy Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
