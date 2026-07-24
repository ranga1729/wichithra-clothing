import { create } from 'zustand'
import { JwtPayload } from '@/types/auth-types'

interface AuthState {
  user: JwtPayload | null
  setUser: (user: JwtPayload | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
