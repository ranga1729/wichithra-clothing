import Link from "next/link"
import Image from "next/image"
import { en } from "@/lib/i18n/en"

export const metadata = {
  title: `${en.company_name} - Authentication`,
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
          <Link href="/" className="mb-8">
            <Image
              src="/logo/kOA_logo_white.png"
              alt="KOA Logo"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </Link>
          <div className="text-center text-white/90 space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">{en.company_name}</h1>
            <p className="text-lg text-white/70 max-w-sm">{en.company_tagline}</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <span>Island-wide Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          {children}
        </div>
      </div>
    </div>
  )
}