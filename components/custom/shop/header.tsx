'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Search, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggler } from '@/components/providers/theme/theme-toggler'

export function KoaHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(3)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-koa-blue w-full">
      
      {/* Main Header - keep the 7xl margin */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center shrink-0">
            <div className="w-30 h-20 relative">
              <Image
                src="/logo/kOA_logo_black.png"
                alt="KOA Logo"
                fill
                sizes="120px"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-[#101010] font-medium hover:text-[#3D79BE] transition">
              Shop
            </Link>
            <Link href="/collections" className="text-[#101010] font-medium hover:text-[#3D79BE] transition">
              Collections
            </Link>
            <Link href="/about" className="text-[#101010] font-medium hover:text-[#3D79BE] transition">
              About
            </Link>
            <Link href="/contact" className="text-[#101010] font-medium hover:text-[#3D79BE] transition">
              Contact
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-[#F3F4F6] rounded-lg transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[#101010]" />
            </button>

            <Link href="/cart" className="relative p-2 hover:bg-[#F3F4F6] rounded-lg transition">
              <ShoppingCart className="w-5 h-5 text-[#101010]" />
              {/* {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#3D79BE] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )} */}
            </Link>

            <Button
              className="flex items-center gap-2 px-4 py-2 bg-[#101010] text-white rounded-lg hover:bg-[#2A2A2A] transition"
              aria-label="Logout"
            >
              <span className="hidden sm:inline text-sm">Logout</span>
            </Button>
            <ThemeToggler />
          </div>
        </div>

        {/* Search Bar - Expandable */}
        {isSearchOpen && (
          <div className="pb-4 border-t border-[#2A2A2A]">
            <div className="flex gap-2 pt-4">
              <input
                type="text"
                placeholder="Search for products..."
                className="flex-1 px-4 py-2 border border-[#2A2A2A] rounded-lg bg-[#F3F4F6] text-[#101010] placeholder-[#2A2A2A] focus:outline-none focus:border-[#3D79BE] focus:ring-1 focus:ring-[#3D79BE]"
              />
              <button className="px-6 py-2 bg-[#3D79BE] text-white rounded-lg hover:bg-[#2D5FA3] transition">
                Search
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
