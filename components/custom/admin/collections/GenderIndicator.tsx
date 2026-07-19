'use client'

import { Badge } from "@/components/ui/badge"
import { GenderTarget } from "@/generated/prisma/enums"
import { cn, GetGenderBadgeStyle } from "@/lib/utils"

interface Props {
  gender: GenderTarget
  className?: string
}

export default function GenderIndicator(props : Props) {
  const config = GetGenderBadgeStyle[props.gender] ?? GetGenderBadgeStyle.UNISEX

  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", config.className, props.className)}>
      {config.label}
    </Badge>
  )
}
