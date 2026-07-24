'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Shirt } from 'lucide-react'

interface ProductRowItem {
  imageUrl?: string | null
  productName: string
  categoryName?: string
  sizeName?: string
  colorName?: string
  colorHexCode?: string | null
  quantity: number
  unitPrice: number | string
  totalPrice: number | string
  productSlug?: string
}

interface ProductRowProps {
  item: ProductRowItem
  href?: string
}

export default function ProductRow({ item, href }: ProductRowProps) {
  const content = (
    <div className="flex items-center gap-4 rounded-lg p-2">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            unoptimized
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Shirt className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="text-xs text-muted-foreground">{item.categoryName ?? 'Uncategorized'}</span>
        <span className="text-sm font-medium truncate text-foreground">{item.productName}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{item.sizeName}</span>
          <div className="flex items-center gap-1">
            {item.colorHexCode && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border border-border"
                style={{ backgroundColor: '#' + item.colorHexCode }}
              />
            )}
            <span className="text-xs text-muted-foreground">{item.colorName}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {item.quantity > 1 && (
          <span className="text-xs text-muted-foreground">
            {item.quantity} × Rs {Number(item.unitPrice).toFixed(2)}
          </span>
        )}
        <span className="text-sm font-semibold whitespace-nowrap text-foreground">
          Rs {Number(item.totalPrice).toFixed(2)}
        </span>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-colors hover:bg-accent/50">
        {content}
      </Link>
    )
  }

  return content
}