'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Shirt } from 'lucide-react'
import { CartItem } from '@/lib/zustand-stores/cart-store'
import { useCartStore } from '@/lib/zustand-stores/cart-store'
import { Button } from '@/components/ui/button'

interface CartItemRowProps {
  item: CartItem
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <Link
      href={`/product/${item.productSlug}`}
      className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent/50"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            unoptimized
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <Shirt className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="text-xs text-muted-foreground">{item.categoryName}</span>
        <span className="text-sm font-medium truncate">{item.productName}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{item.size}</span>
          <div className="flex items-center gap-1">
            {item.color.hexCode && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border border-neutral-200"
                style={{ backgroundColor: '#' + item.color.hexCode }}
              />
            )}
            <span className="text-xs text-muted-foreground">{item.color.name}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            removeItem(item.variantId)
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-3 w-3" />
        </Button>
        <span className="text-sm font-semibold whitespace-nowrap">
          Rs {item.price.toFixed(2)}
        </span>
      </div>
    </Link>
  )
}
