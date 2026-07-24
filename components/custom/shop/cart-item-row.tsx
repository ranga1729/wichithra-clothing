'use client'

import { X } from 'lucide-react'
import { CartItem } from '@/lib/zustand-stores/cart-store'
import { useCartStore } from '@/lib/zustand-stores/cart-store'
import { Button } from '@/components/ui/button'
import ProductRow from './product-row'

interface CartItemRowProps {
  item: CartItem
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <div className="relative group">
      <ProductRow
        item={{
          imageUrl: item.imageUrl,
          productName: item.productName,
          categoryName: item.categoryName,
          sizeName: item.size,
          colorName: item.color.name,
          colorHexCode: item.color.hexCode,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          productSlug: item.productSlug,
        }}
        href={`/product/${item.productSlug}`}
      />
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => removeItem(item.variantId)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}