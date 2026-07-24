'use client'

import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/zustand-stores/cart-store'
import { useAuthStore } from '@/lib/zustand-stores/auth-store'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

export default function CartFooter() {
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)
  const setOpen = useCartStore((s) => s.setOpen)
  const totalPrice = useCartStore((s) => s.totalPrice)
  const items = useCartStore((s) => s.items)
  const user = useAuthStore((s) => s.user)

  const handleCheckout = () => {
    setOpen(false)
    if (!user) {
      toast.error('Please login to proceed with checkout')
      router.push('/auth/login')
      return
    }
    router.push('/billing')
  }

  return (
    <div className="shrink-0 border-t">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={items.length === 0}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={clearCart}
          >
            Clear All
          </Button>
          <Button
            size="sm"
            disabled={items.length === 0}
            onClick={handleCheckout}
          >
            Checkout
          </Button>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold">Rs. {totalPrice().toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
