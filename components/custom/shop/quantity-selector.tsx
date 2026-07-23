'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  max?: number
  disabled?: boolean
}

export default function QuantitySelector({
  value,
  onChange,
  max = 99,
  disabled = false,
}: QuantitySelectorProps) {
  return (
    <ButtonGroup>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value <= 0}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <ButtonGroupText className="min-w-[3rem] justify-center">
        {value}
      </ButtonGroupText>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  )
}
