import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package } from "lucide-react";
import Breadcrumbs from "@/components/custom/shop/breadcrumbs";

export default function Collections() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Collections' }]} />
      
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="p-6 bg-muted rounded-full mb-6">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
          Collections
        </h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Curated sets of similar products, coming soon. We&apos;re putting together exciting collections of our best apparel.
        </p>
        <div className="flex gap-3">
          <Button asChild size="lg">
            <Link href="/search">
              Browse All Products
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
