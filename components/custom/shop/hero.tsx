import Image from 'next/image'
import Link from 'next/link'

export function KoaHero() {
  return (
    <section className="relative h-96 sm:h-128 md:h-144 lg:h-160 overflow-hidden w-full max-w-7xl">
      {/* Background Image */}
      <Image
        src="/hero.png"
        alt="Male athlete in performance activewear"
        fill
        className="object-cover"
        priority
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 max-w-2xl">
          Unleash Your Power
        </h1>
        <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl">
          Premium activewear designed for warriors. Performance meets style.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/shop"
            className="px-8 py-3 bg-[#3D79BE] text-white font-semibold rounded-lg hover:bg-[#2D5FA3] transition"
          >
            Shop Now
          </Link>
          <Link
            href="/collections"
            className="px-8 py-3 bg-white text-[#101010] font-semibold rounded-lg hover:bg-[#F3F4F6] transition"
          >
            View Collections
          </Link>
        </div>
      </div>
    </section>
  )
}
