import { create } from "zustand"

interface BreadcrumbState {
  dynamicLabel: string | null
  setDynamicLabel: (label: string | null) => void
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  dynamicLabel: null,
  setDynamicLabel: (label) => set({ dynamicLabel: label }),
}))