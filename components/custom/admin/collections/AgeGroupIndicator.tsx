'use client'

import { Badge } from "@/components/ui/badge"
import { AgeGroup } from "@/generated/prisma/enums"
import { cn, GetAgeGroupBadgeStyle } from "@/lib/utils"

interface Props {
  ageGroup: AgeGroup
  className?: string
}

export default function AgeGroupIndicator(props : Props) {
  const config = GetAgeGroupBadgeStyle[props.ageGroup] ?? GetAgeGroupBadgeStyle.ADULT

  return (
    <Badge variant="outline" className={cn("border-transparent font-medium", config.className, props.className)}>
      {config.label}
    </Badge>
  )
}
