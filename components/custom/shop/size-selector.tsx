'use client'

import { ClothingSize } from '@/generated/prisma/enums'
import { cn } from '@/lib/utils'

const SIZE_ORDER: ClothingSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'OS']

interface SizeSelectorProps {
  allSizes: ClothingSize[]
  availableSizes: ClothingSize[]
  selectedSize: ClothingSize | null
  onSelect: (size: ClothingSize) => void
  disabled?: boolean
}

export default function SizeSelector({
  allSizes,
  availableSizes,
  selectedSize,
  onSelect,
  disabled = false,
}: SizeSelectorProps) {
  const sortedSizes = [...allSizes].sort(
    (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
  )

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-700">
        Size{selectedSize ? `: ${selectedSize}` : ''}
      </span>
      <div className="flex flex-wrap gap-2">
        {sortedSizes.map((size) => {
          const isAvailable = availableSizes.includes(size)
          const isSelected = selectedSize === size

          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              disabled={disabled || !isAvailable}
              aria-pressed={isSelected}
              className={cn(
                'h-10 min-w-10 rounded-full border px-3 text-sm font-medium transition-all',
                isSelected && 'border-neutral-900 bg-neutral-900 text-white',
                !isSelected && isAvailable && 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500',
                !isAvailable && 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-300 line-through',
                disabled && 'pointer-events-none opacity-50',
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
