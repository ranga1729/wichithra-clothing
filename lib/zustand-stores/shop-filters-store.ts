import { create } from "zustand"
import { ClothingSize } from "@/generated/prisma/enums"

interface ShopFiltersState {
  isOpen: boolean
  selectedCategories: string[]
  selectedDesigns: string[]
  selectedColors: string[]
  selectedSizes: ClothingSize[]
  priceRange: [number, number]
  setOpen: (open: boolean) => void
  toggleCategory: (name: string) => void
  toggleDesign: (slug: string) => void
  toggleColor: (name: string) => void
  toggleSize: (size: ClothingSize) => void
  setPriceRange: (range: [number, number]) => void
  initializeFromUrl: (params: {
    category?: string[]
    design?: string[]
    color?: string[]
    size?: ClothingSize[]
    minPrice?: number
    maxPrice?: number
  }) => void
  reset: () => void
}

const initialState = {
  isOpen: false,
  selectedCategories: [],
  selectedDesigns: [],
  selectedColors: [],
  selectedSizes: [],
  priceRange: [0, 0] as [number, number],
}

export const useShopFiltersStore = create<ShopFiltersState>()((set) => ({
  ...initialState,

  setOpen: (open) => set({ isOpen: open }),

  toggleCategory: (name) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(name)
        ? state.selectedCategories.filter((c) => c !== name)
        : [...state.selectedCategories, name],
    })),

  toggleDesign: (slug) =>
    set((state) => ({
      selectedDesigns: state.selectedDesigns.includes(slug)
        ? state.selectedDesigns.filter((d) => d !== slug)
        : [...state.selectedDesigns, slug],
    })),

  toggleColor: (name) =>
    set((state) => ({
      selectedColors: state.selectedColors.includes(name)
        ? state.selectedColors.filter((c) => c !== name)
        : [...state.selectedColors, name],
    })),

  toggleSize: (size) =>
    set((state) => ({
      selectedSizes: state.selectedSizes.includes(size)
        ? state.selectedSizes.filter((s) => s !== size)
        : [...state.selectedSizes, size],
    })),

  setPriceRange: (range) => set({ priceRange: range }),

  initializeFromUrl: (params) =>
    set({
      selectedCategories: params.category ?? [],
      selectedDesigns: params.design ?? [],
      selectedColors: params.color ?? [],
      selectedSizes: params.size ?? [],
      priceRange: [
        params.minPrice ?? 0,
        params.maxPrice ?? 0,
      ],
    }),

  reset: () =>
    set({
      selectedCategories: [],
      selectedDesigns: [],
      selectedColors: [],
      selectedSizes: [],
      priceRange: [0, 0],
    }),
}))
