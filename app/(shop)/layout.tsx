import { KoaFooter } from "@/components/custom/shop/footer";
import { KoaHeader } from "@/components/custom/shop/header";
import AuthProvider from "@/components/providers/auth/auth-provider";
import { getUserFromCookie } from "@/lib/get-cookie";
import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'KOA - Premium Activewear',
  description: 'Discover premium activewear designed for athletes and fitness enthusiasts. High-performance clothing crafted for your active lifestyle.',
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


export default async function ShopFrontLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserFromCookie();

  return (
    <AuthProvider user={user}>
      <div className={`${geistSans.variable} ${geistMono.variable} [--header-height:calc(--spacing(14))] font-sans antialiased bg-background text-foreground min-h-lvh flex flex-col items-center`}>
        <KoaHeader user={user} />
        <main className="w-full flex-1">
          {children}
        </main>
        <KoaFooter/>
      </div>
    </AuthProvider>
  )
}
