'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Shirt } from 'lucide-react'
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { ProductDetailImage } from '@/schemas/shop-schemas'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: ProductDetailImage[]
  selectedColorId: string | null
  altText?: string
}

export default function ProductGallery({ images, selectedColorId, altText }: ProductGalleryProps) {
  const [api, setApi] = useState<CarouselApi>(undefined)
  const [activeIndex, setActiveIndex] = useState(0)

  const displayedImages = useMemo(() => {
    if (!images.length) return []
    if (selectedColorId) {
      const colorSpecific = images.filter((img) => img.colorId === selectedColorId)
      if (colorSpecific.length > 0) return colorSpecific
    }
    return images.filter((img) => img.colorId === null).length > 0
      ? images.filter((img) => img.colorId === null)
      : images
  }, [images, selectedColorId])

  useEffect(() => {
    api?.scrollTo(0)
  }, [selectedColorId, api])

  useEffect(() => {
    if (!api) return
    const handleSelect = () => {
      setActiveIndex(api.selectedScrollSnap())
    }
    api.on('select', handleSelect)
    api.on('reInit', handleSelect)
    return () => {
      api.off('select', handleSelect)
      api.off('reInit', handleSelect)
    }
  }, [api])

  const handleThumbnailClick = useCallback(
    (index: number) => {
      api?.scrollTo(index)
      setActiveIndex(index)
    },
    [api],
  )

  if (!displayedImages.length) {
    return (
      <div className="flex aspect-3/4 w-full items-center justify-center rounded-lg bg-neutral-100">
        <Shirt className="h-24 w-24 text-neutral-300" />
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-x-auto lg:overflow-y-auto">
        {displayedImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => handleThumbnailClick(index)}
            className={cn(
              'relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all',
              activeIndex === index
                ? 'border-neutral-900'
                : 'border-transparent opacity-60 hover:opacity-100',
            )}
          >
            <Image
              src={image.imageUrl}
              alt={image.altText || altText || ''}
              fill
              unoptimized
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>

      {/* Main carousel */}
      <div className="relative flex-1 overflow-hidden rounded-lg bg-neutral-100">
        <Carousel
          setApi={setApi}
          opts={{ loop: false, align: 'start' }}
          className="w-full"
        >
          <CarouselContent>
            {displayedImages.map((image) => (
              <CarouselItem key={image.id}>
                <div className="relative aspect-3/4 w-full">
                  <Image
                    src={image.imageUrl}
                    alt={image.altText || altText || ''}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}
