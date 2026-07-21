"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface SearchFilterBadgeProps {
  label: string
  selected: boolean
  onClick: () => void
  variant?: "default" | "color"
  hexCode?: string | null
  swatchImageUrl?: string | null
}

export function SearchFilterBadge({
  label,
  selected,
  onClick,
  variant = "default",
  hexCode,
  swatchImageUrl,
}: SearchFilterBadgeProps) {
  return (
    <Badge
      role="button"
      tabIndex={0}
      variant={selected ? "default" : "outline"}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className={cn(
        "cursor-pointer select-none px-3 py-1 text-sm transition-colors",
        selected
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-background text-foreground hover:bg-accent",
      )}
    >
      {variant === "color" && (
        <span className="inline-flex shrink-0 items-center">
          {swatchImageUrl ? (
            <span className="relative size-4 overflow-hidden rounded-full border">
              <Image
                src={swatchImageUrl}
                alt={label}
                fill
                unoptimized
                sizes="16px"
                className="object-cover"
              />
            </span>
          ) : hexCode ? (
            <span
              className="size-4 rounded-full border"
              style={{ backgroundColor: `#${hexCode}` }}
            />
          ) : null}
        </span>
      )}
      {label}
    </Badge>
  )
}
