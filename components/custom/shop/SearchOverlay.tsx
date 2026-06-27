'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Search } from 'lucide-react'
import { useSearchStore } from '@/lib/zustand-stores/use-search-store'
import path from 'path'

export default function SearchOverlay() {
  const { isOpen, closeSearch } = useSearchStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    console.log("pathyname: ", pathname);
    console.log("searchParams: ", searchParams);
  }, [pathname, searchParams])
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    closeSearch()
  }, [pathname, searchParams, closeSearch])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeSearch])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="search-overlay"
          className="fixed inset-0 z-50 flex flex-col items-center bg-black/70 backdrop-blur-md"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          onClick={closeSearch}
        >
          <button
            type="button"
            className="absolute top-6 right-6 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              closeSearch()
            }}
            aria-label="Close search"
          >
            <X className="size-5" />
          </button>

          <div
            className="mt-32 w-full max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          > 
            
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for products..."
                className="w-full h-14 pl-14 pr-4 text-lg bg-white/95 text-neutral-900 rounded-xl border-0 shadow-2xl placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
