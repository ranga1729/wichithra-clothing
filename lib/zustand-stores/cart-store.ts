import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ClothingSize, GenderTarget, AgeGroup } from "@/generated/prisma/enums"
import toast from "react-hot-toast"

export interface CartItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  categoryName: string
  categorySlug: string
  variantId: string
  inventoryId: string | null
  size: ClothingSize
  color: {
    id: string
    name: string
    hexCode: string | null
    swatchImageUrl: string | null
  }
  brandName: string | null
  gender: GenderTarget
  ageGroup: AgeGroup
  imageUrl: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem, quantity?: number) => void
  updateItemQuantity: (variantId: string, quantity: number) => void
  removeItem: (variantId: string) => void
  clearCart: () => void
  setOpen: (open: boolean) => void
  totalItems: () => number
  totalPrice: () => number
}

const getMaxItems = (): number => {
  const val = process.env.MAX_CART_ITEMS
  const parsed = val ? parseInt(val, 10) : 10
  return isNaN(parsed) ? 10 : parsed
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        const { items } = get()
        const maxItems = getMaxItems()

        const existing = items.find((i) => i.variantId === item.variantId)

        if (existing) {
          const newQty = existing.quantity + quantity
          set({
            items: items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: newQty } : i,
            ),
          })
          toast.success("Cart updated")
          return
        }

        if (items.length >= maxItems) {
          toast.error(`Cart is full. Maximum ${maxItems} items allowed per order.`)
          return
        }

        set({ items: [...items, { ...item, quantity }] })
        toast.success("Added to cart")
      },

      updateItemQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.variantId !== variantId) })
          return
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        })
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) })
      },

      clearCart: () => {
        set({ items: [] })
      },

      setOpen: (open) => {
        set({ isOpen: open })
      },

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "KOA-Cart",
      partialize: (state) => ({ items: state.items }),
    },
  )
)
