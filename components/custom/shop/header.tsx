'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Search } from 'lucide-react'
import UserAccount from '@/components/user-account'
import SearchDialog from './search-dialog'

export function KoaHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cartCount, setCartCount] = useState(3)
  
  // States to track scroll depth and cursor hovering
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // The background becomes white if the page is scrolled down OR if the user hovers over it
  const isSolidActive = isScrolled || isHovered

  return (
    <header 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isSolidActive 
          ? "bg-white border-b border-neutral-200 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Main Header */}
      {/* Added 'relative' here so the absolute logo aligns to this container */}
      <div className={`max-w-7xl mx-auto px-4 relative`}>
        <div className="flex items-center justify-between h-20">
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/shop" 
              className={`font-medium transition duration-300 ${isSolidActive ? 'text-koa-black hover:text-[#3D79BE]' : 'text-white hover:text-neutral-300'}`}
            >
              Shop
            </Link>
            <Link 
              href="/collections" 
              className={`font-medium transition duration-300 ${isSolidActive ? 'text-koa-black hover:text-[#3D79BE]' : 'text-white hover:text-neutral-300'}`}
            >
              Categories
            </Link>
            <Link 
              href="/about" 
              className={`font-medium transition duration-300 ${isSolidActive ? 'text-koa-black hover:text-[#3D79BE]' : 'text-white hover:text-neutral-300'}`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`font-medium transition duration-300 ${isSolidActive ? 'text-koa-black hover:text-[#3D79BE]' : 'text-white hover:text-neutral-300'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Spacer block to keep flex alignment working on mobile/desktop without layout collapse */}
          <div className="md:hidden invisible w-5" />

          {/* Logo Section - Positioned Absolutely */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link href="/" className="flex items-center shrink-0">
              <div className="w-30 h-20 relative">
                <Image
                  src="/logo/kOA_logo_black.png"
                  alt="KOA Logo"
                  fill
                  sizes="120px"
                  className={`object-contain transition-all duration-300 ${!isSolidActive && 'invert brightness-0'}`} 
                />
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 z-20">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-lg transition duration-300 ${isSolidActive ? 'hover:bg-[#F3F4F6]' : 'hover:bg-white/10'}`}
              aria-label="Search"
            >
              <Search className={`w-5 h-5 transition-colors duration-300 ${isSolidActive ? 'text-koa-black' : 'text-white'}`} />
            </button>

            <Link 
              href="/cart" 
              className={`relative p-2 rounded-lg transition duration-300 ${isSolidActive ? 'hover:bg-[#F3F4F6]' : 'hover:bg-white/10'}`}
            >
              <ShoppingCart className={`w-5 h-5 transition-colors duration-300 ${isSolidActive ? 'text-koa-black' : 'text-white'}`} />
            </Link>

            <div className={isSolidActive ? 'text-koa-black' : 'text-white'}>
              <UserAccount isSolidActive={isSolidActive} />
            </div>
          </div>
        </div>

        {/* Search Bar - Expandable */}
        {/* {isSearchOpen && (
          <div className={`pb-4 border-t transition-colors duration-300 ${isSolidActive ? 'border-neutral-200' : 'border-white/20'}`}>
            <div className="flex gap-2 pt-4">
              <input
                type="text"
                placeholder="Search for products..."
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#3D79BE] focus:border-[#3D79BE] transition-colors duration-300 ${
                  isSolidActive 
                    ? 'bg-[#F3F4F6] text-koa-black border-[#2A2A2A] placeholder-[#2A2A2A]' 
                    : 'bg-white/10 text-white border-white/30 placeholder-white/60'
                }`}
              />
              <button className="px-6 py-2 bg-[#3D79BE] text-white rounded-lg hover:bg-[#2D5FA3] transition">
                Search
              </button>
            </div>
          </div>
        )} */}

        <SearchDialog open={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      </div>
    </header>
  )
}