'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/zustand-stores/auth-store'
import { JwtPayload } from '@/types/auth-types'

export default function AuthProvider({ user, children }: { user: JwtPayload | null; children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return <>{children}</>
}
