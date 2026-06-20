import { KoaFeaturedProducts } from "@/components/custom/shop/featured-products";
import { KoaFeatures } from "@/components/custom/shop/features";
import { KoaHero } from "@/components/custom/shop/hero";

export default function ShopFront() {
  const userName = "Next.js User";
  
  return (
    <div className="">
      <KoaHero />
      <KoaFeaturedProducts />
      <KoaFeatures />
    </div>
  );
}