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
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
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

      addItem: (item) => {
        const { items } = get()
        const maxItems = getMaxItems()

        if (items.some((i) => i.variantId === item.variantId)) {
          toast.error("This item is already in your cart")
          return
        }

        if (items.length >= maxItems) {
          toast.error(`Cart is full. Maximum ${maxItems} items allowed per order.`)
          return
        }

        set({ items: [...items, item] })
        toast.success("Added to cart")
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

      totalItems: () => get().items.length,

      totalPrice: () => get().items.reduce((sum, item) => sum + item.price, 0),
    }),
    {
      name: "KOA-Cart",
      partialize: (state) => ({ items: state.items }),
    },
  )
)
