import { KoaFeaturedProducts } from "@/components/custom/shop/featured-products";
import { KoaFeatures } from "@/components/custom/shop/features";
import { KoaFooter } from "@/components/custom/shop/footer";
import { KoaHeader } from "@/components/custom/shop/header";
import { KoaHero } from "@/components/custom/shop/hero";
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'KOA - Premium Activewear',
  description: 'Discover premium activewear designed for athletes and fitness enthusiasts. High-performance clothing crafted for your active lifestyle.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}


export default function ShopFrontLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="[--header-height:calc(--spacing(14))] font-sans antialiased bg-background text-foreground min-h-lvh flex flex-col items-center">
      <KoaHeader />
      <KoaHero />
      <main className="w-full max-w-7xl">
        {children}
      </main>
      <KoaFeaturedProducts />
      <KoaFeatures />
      <KoaFooter/>
    </div>
  );
}
