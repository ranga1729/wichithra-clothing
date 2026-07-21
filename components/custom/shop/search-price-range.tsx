"use client"

import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { useCallback } from "react"

interface SearchPriceRangeProps {
  min: number
  max: number
  value: [number, number]
  onValueChange: (range: [number, number]) => void
}

export function SearchPriceRange({
  min,
  max,
  value,
  onValueChange,
}: SearchPriceRangeProps) {
  const step = max > 1000 ? Math.ceil((max - min) / 100 / 50) * 50 || 50 : max > 100 ? 10 : 1

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value === "" ? min : Number(e.target.value)
      onValueChange([Math.min(val, value[1]), value[1]])
    },
    [min, value, onValueChange],
  )

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value === "" ? max : Number(e.target.value)
      onValueChange([value[0], Math.max(val, value[0])])
    },
    [max, value, onValueChange],
  )

  return (
    <div className="space-y-4">
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(val) => onValueChange(val as [number, number])}
      />
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input
            type="number"
            min={min}
            max={value[1]}
            value={value[0]}
            onChange={handleMinChange}
            className="h-9 text-center"
          />
        </div>
        <span className="text-muted-foreground text-sm">&ndash;</span>
        <div className="flex-1">
          <Input
            type="number"
            min={value[0]}
            max={max}
            value={value[1]}
            onChange={handleMaxChange}
            className="h-9 text-center"
          />
        </div>
      </div>
    </div>
  )
}
