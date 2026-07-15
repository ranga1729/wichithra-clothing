'use client'

import { ProductSearchResult } from "@/schemas/shop-schemas";
import { PackageOpen, Shirt } from "lucide-react";
import Link from "next/link";
import Image from 'next/image'

export default function ProductCard(props: ProductSearchResult) {
  return (
    <Link
      key={props.id}
      href={`/product/${props.slug}`}
      className="group overflow-hidden rounded-lg border bg-white transition hover:shadow-lg"
    >
      <div className="relative h-64 bg-neutral-100">
        {props.primaryImage ? (
          <Image
            src={props.primaryImage}
            alt={props.name}
            fill
            unoptimized
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <Shirt className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-row items-center justify-between">
          <h3 className="mb-2 text-lg font-semibold flex-1">
            {props.name}
          </h3>
          <p className="mb-1 text-sm font-semibold text-blue-600">
            {props.categoryName}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {props.price ? `Rs ${props.price.toFixed(2)}` : "Price unavailable"}
          </span>
        </div>
      </div>
    </Link>
  )
}