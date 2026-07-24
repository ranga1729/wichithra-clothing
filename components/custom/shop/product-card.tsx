'use client'

import { ProductSearchResult } from "@/schemas/shop-schemas";
import { Shirt } from "lucide-react";
import Link from "next/link";
import Image from 'next/image'
import { Badge } from "@/components/ui/badge";

export default function ProductCard(props: ProductSearchResult) {
  const hasDiscount = props.discountPercentage && Number(props.discountPercentage) > 0

  return (
    <Link
      key={props.id}
      href={`/product/${props.slug}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {props.primaryImage ? (
          <Image
            src={props.primaryImage}
            alt={props.name}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Shirt className="h-12 w-12" />
          </div>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <Badge 
            variant="destructive" 
            className="absolute top-3 left-3 px-2 py-0.5 text-xs font-semibold"
          >
            -{Number(props.discountPercentage)}%
          </Badge>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
          {props.categoryName}
        </p>
        <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {props.name}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground">
            {props.price ? `Rs ${props.price.toFixed(2)}` : "Price unavailable"}
          </span>
        </div>

        {/* Color swatches */}
        {props.colors && props.colors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            {props.colors.slice(0, 5).map((color) => (
              <span
                key={color.name}
                className="inline-block h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: color.hexCode ? `#${color.hexCode}` : '#ccc' }}
                title={color.name}
              />
            ))}
            {props.colors.length > 5 && (
              <span className="text-xs text-muted-foreground">+{props.colors.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
