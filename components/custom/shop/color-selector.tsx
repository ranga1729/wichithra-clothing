'use client'

import Image from 'next/image'
import { ProductDetailColor } from '@/schemas/shop-schemas'
import { cn } from '@/lib/utils'

interface ColorSelectorProps {
  allColors: ProductDetailColor[]
  availableColors: string[]
  selectedColor: ProductDetailColor | null
  onSelect: (color: ProductDetailColor) => void
  disabled?: boolean
}

export default function ColorSelector({
  allColors,
  availableColors,
  selectedColor,
  onSelect,
  disabled = false,
}: ColorSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-700">
        Color{selectedColor ? `: ${selectedColor.name}` : ''}
      </span>
      <div className="flex flex-wrap gap-3">
        {allColors.map((color) => {
          const isAvailable = availableColors.includes(color.id)
          const isSelected = selectedColor?.id === color.id

          return (
            <button
              key={color.id}
              type="button"
              
              onClick={() => onSelect(color)}
              disabled={disabled || !isAvailable}
              aria-label={`Color: ${color.name}`}
              className={cn(
                'relative h-9 w-9 rounded-full border-2 transition-all',
                isSelected && 'ring-2 ring-offset-2 ring-neutral-900',
                !isSelected && isAvailable && 'border-neutral-300 hover:border-neutral-500',
                !isAvailable && 'cursor-not-allowed border-neutral-200 opacity-40',
                disabled && 'pointer-events-none',
              )}
            >
              {color.swatchImageUrl ? (
                <Image
                  src={color.swatchImageUrl}
                  alt={color.name}
                  fill
                  unoptimized
                  className="rounded-full object-cover"
                  sizes="36px"
                />
              ) : (
                <span
                  className="block h-full w-full rounded-full"
                  style={{ backgroundColor: "#" + color.hexCode || '#ccc' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
