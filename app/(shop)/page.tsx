'use client'

import { KoaFeaturedProducts } from "@/components/custom/shop/featured-products";
import { KoaFeatures } from "@/components/custom/shop/features";
import { KoaHero } from "@/components/custom/shop/hero";

export default function ShopFront() {
  
  return (
    <div className="flex flex-col items-center">
      <KoaHero />
      <KoaFeaturedProducts />
      <KoaFeatures />
    </div>
  );
}