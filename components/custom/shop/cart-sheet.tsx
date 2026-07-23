'use client'

import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/zustand-stores/cart-store'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import CartItemRow from './cart-item-row'
import CartFooter from './cart-footer'

export default function CartSheet() {
  const isOpen = useCartStore((s) => s.isOpen)
  const setOpen = useCartStore((s) => s.setOpen)
  const items = useCartStore((s) => s.items)
  const totalItems = useCartStore((s) => s.totalItems)

  const count = totalItems()

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="text-lg">
            My Cart
            {count > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({count} {count === 1 ? 'item' : 'items'})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
              <p className="text-sm">Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <CartItemRow key={item.variantId} item={item} />
              ))}
            </div>
          )}
        </div>

        <CartFooter />
      </SheetContent>
    </Sheet>
  )
}
